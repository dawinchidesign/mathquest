-- ============================================================
-- MathQuest · Supabase схемасы
-- Supabase → SQL Editor → New query → осы файлды толық қойып, Run басыңыз.
-- Файлды қайта іске қосуға болады: бар кестелер мен деректер өшпейді.
-- ============================================================

create extension if not exists pgcrypto with schema extensions;

-- ---------- Кестелер ----------

create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  role        text not null default 'student' check (role in ('teacher', 'student')),
  full_name   text not null default '' check (char_length(full_name) <= 80),
  login       text unique check (login is null or login ~ '^[a-z0-9._-]{3,24}$'),
  school      text check (school is null or char_length(school) <= 120),
  created_at  timestamptz not null default now()
);

create table if not exists public.classes (
  id          uuid primary key default gen_random_uuid(),
  teacher_id  uuid not null references public.profiles (id) on delete cascade,
  name        text not null check (char_length(name) between 1 and 60),
  code        text not null unique check (code ~ '^[A-Z0-9]{6}$'),
  created_at  timestamptz not null default now()
);
create index if not exists classes_teacher_idx on public.classes (teacher_id);

create table if not exists public.class_members (
  class_id    uuid not null references public.classes (id) on delete cascade,
  student_id  uuid not null references public.profiles (id) on delete cascade,
  joined_at   timestamptz not null default now(),
  primary key (class_id, student_id)
);
create index if not exists class_members_student_idx on public.class_members (student_id);

create table if not exists public.progress (
  student_id      uuid primary key references public.profiles (id) on delete cascade,
  state           jsonb not null default '{}'::jsonb,
  xp              integer not null default 0,
  answered        integer not null default 0,
  correct         integer not null default 0,
  mastered_count  integer not null default 0,
  lessons_done    integer not null default 0,
  streak          integer not null default 0,
  module_mastery  jsonb not null default '{}'::jsonb,
  lesson_mastery  jsonb not null default '{}'::jsonb,
  last_active     timestamptz,
  updated_at      timestamptz not null default now(),
  constraint progress_state_size check (pg_column_size(state) < 400000)
);

create table if not exists public.assignments (
  id          uuid primary key default gen_random_uuid(),
  class_id    uuid not null references public.classes (id) on delete cascade,
  title       text not null check (char_length(title) between 1 and 120),
  note        text check (note is null or char_length(note) <= 500),
  lesson_ids  text[] not null default '{}',
  due_date    date,
  created_at  timestamptz not null default now()
);
create index if not exists assignments_class_idx on public.assignments (class_id);

-- ---------- Көмекші функциялар (RLS рекурсиясын болдырмау үшін) ----------

create or replace function public.is_class_teacher(p_class uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from classes where id = p_class and teacher_id = auth.uid());
$$;

create or replace function public.is_class_member(p_class uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from class_members where class_id = p_class and student_id = auth.uid());
$$;

create or replace function public.is_teacher_of(p_student uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from class_members m join classes c on c.id = m.class_id
    where m.student_id = p_student and c.teacher_id = auth.uid()
  );
$$;

create or replace function public.is_my_teacher(p_teacher uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from class_members m join classes c on c.id = m.class_id
    where m.student_id = auth.uid() and c.teacher_id = p_teacher
  );
$$;

create or replace function public.my_role()
returns text language sql stable security definer set search_path = public as $$
  select role from profiles where id = auth.uid();
$$;

-- ---------- Тіркелу кезінде профиль құру ----------

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  meta   jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  v_role text  := case when meta->>'role' = 'teacher' then 'teacher' else 'student' end;
  v_login text := nullif(lower(trim(meta->>'login')), '');
  v_class uuid;
begin
  insert into profiles (id, role, full_name, login, school)
  values (
    new.id,
    v_role,
    left(coalesce(nullif(trim(meta->>'full_name'), ''), split_part(new.email, '@', 1)), 80),
    v_login,
    left(nullif(trim(meta->>'school'), ''), 120)
  )
  on conflict (id) do nothing;

  if v_role = 'student' and nullif(meta->>'class_code', '') is not null then
    select id into v_class from classes where code = upper(trim(meta->>'class_code'));
    if v_class is not null then
      insert into class_members (class_id, student_id) values (v_class, new.id)
      on conflict do nothing;
    end if;
  end if;

  insert into progress (student_id) values (new.id) on conflict do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- RPC: тіркелуге дейін (anon) ----------

create or replace function public.class_preview(p_code text)
returns table (class_name text, teacher_name text)
language sql stable security definer set search_path = public as $$
  select c.name, p.full_name
  from classes c join profiles p on p.id = c.teacher_id
  where c.code = upper(trim(p_code));
$$;

create or replace function public.login_available(p_login text)
returns boolean language sql stable security definer set search_path = public as $$
  select not exists (select 1 from profiles where login = lower(trim(p_login)));
$$;

-- ---------- RPC: мұғалім ----------

create or replace function public.create_class(p_name text)
returns classes language plpgsql security definer set search_path = public as $$
declare
  v_code text;
  v_row  classes;
  alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
begin
  if my_role() is distinct from 'teacher' then
    raise exception 'only_teachers' using errcode = '42501';
  end if;
  loop
    v_code := '';
    for i in 1..6 loop
      v_code := v_code || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
    end loop;
    exit when not exists (select 1 from classes where code = v_code);
  end loop;
  insert into classes (teacher_id, name, code)
  values (auth.uid(), left(trim(p_name), 60), v_code)
  returning * into v_row;
  return v_row;
end;
$$;

create or replace function public.class_roster(p_class uuid)
returns jsonb language plpgsql stable security definer set search_path = public as $$
begin
  if not is_class_teacher(p_class) then
    raise exception 'not_your_class' using errcode = '42501';
  end if;
  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'id', p.id,
      'full_name', p.full_name,
      'login', p.login,
      'joined_at', m.joined_at,
      'xp', coalesce(g.xp, 0),
      'answered', coalesce(g.answered, 0),
      'correct', coalesce(g.correct, 0),
      'mastered_count', coalesce(g.mastered_count, 0),
      'lessons_done', coalesce(g.lessons_done, 0),
      'streak', coalesce(g.streak, 0),
      'module_mastery', coalesce(g.module_mastery, '{}'::jsonb),
      'lesson_mastery', coalesce(g.lesson_mastery, '{}'::jsonb),
      'last_active', g.last_active
    ) order by p.full_name)
    from class_members m
    join profiles p on p.id = m.student_id
    left join progress g on g.student_id = m.student_id
    where m.class_id = p_class
  ), '[]'::jsonb);
end;
$$;

create or replace function public.reset_student_password(p_student uuid, p_password text)
returns void language plpgsql security definer set search_path = public, extensions as $$
begin
  if not is_teacher_of(p_student) then
    raise exception 'not_your_student' using errcode = '42501';
  end if;
  if char_length(p_password) < 6 then
    raise exception 'password_too_short' using errcode = '22023';
  end if;
  update auth.users
     set encrypted_password = extensions.crypt(p_password, extensions.gen_salt('bf')),
         updated_at = now()
   where id = p_student;
end;
$$;

-- ---------- RPC: оқушы ----------

create or replace function public.join_class(p_code text)
returns classes language plpgsql security definer set search_path = public as $$
declare v_row classes;
begin
  if my_role() is distinct from 'student' then
    raise exception 'only_students' using errcode = '42501';
  end if;
  select * into v_row from classes where code = upper(trim(p_code));
  if v_row.id is null then
    raise exception 'class_not_found' using errcode = 'P0002';
  end if;
  insert into class_members (class_id, student_id) values (v_row.id, auth.uid())
  on conflict do nothing;
  return v_row;
end;
$$;

create or replace function public.my_classes()
returns jsonb language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', c.id, 'name', c.name, 'code', c.code, 'teacher_name', t.full_name
  ) order by m.joined_at), '[]'::jsonb)
  from class_members m
  join classes c on c.id = m.class_id
  join profiles t on t.id = c.teacher_id
  where m.student_id = auth.uid();
$$;

-- ---------- Row Level Security ----------

alter table public.profiles      enable row level security;
alter table public.classes       enable row level security;
alter table public.class_members enable row level security;
alter table public.progress      enable row level security;
alter table public.assignments   enable row level security;

drop policy if exists "profiles read"   on public.profiles;
drop policy if exists "profiles update" on public.profiles;
create policy "profiles read" on public.profiles for select to authenticated
  using (id = auth.uid() or is_teacher_of(id) or is_my_teacher(id));
create policy "profiles update" on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());
revoke insert, update, delete on public.profiles from anon, authenticated;
grant update (full_name, school) on public.profiles to authenticated;

drop policy if exists "classes read"   on public.classes;
drop policy if exists "classes update" on public.classes;
drop policy if exists "classes delete" on public.classes;
create policy "classes read" on public.classes for select to authenticated
  using (teacher_id = auth.uid() or is_class_member(id));
create policy "classes update" on public.classes for update to authenticated
  using (teacher_id = auth.uid()) with check (teacher_id = auth.uid());
create policy "classes delete" on public.classes for delete to authenticated
  using (teacher_id = auth.uid());
revoke insert, update on public.classes from anon, authenticated;
grant update (name) on public.classes to authenticated;

drop policy if exists "members read"   on public.class_members;
drop policy if exists "members delete" on public.class_members;
create policy "members read" on public.class_members for select to authenticated
  using (student_id = auth.uid() or is_class_teacher(class_id));
create policy "members delete" on public.class_members for delete to authenticated
  using (student_id = auth.uid() or is_class_teacher(class_id));
revoke insert, update on public.class_members from anon, authenticated;

drop policy if exists "progress read"   on public.progress;
drop policy if exists "progress insert" on public.progress;
drop policy if exists "progress update" on public.progress;
create policy "progress read" on public.progress for select to authenticated
  using (student_id = auth.uid() or is_teacher_of(student_id));
create policy "progress insert" on public.progress for insert to authenticated
  with check (student_id = auth.uid());
create policy "progress update" on public.progress for update to authenticated
  using (student_id = auth.uid()) with check (student_id = auth.uid());

drop policy if exists "assignments read"   on public.assignments;
drop policy if exists "assignments write"  on public.assignments;
create policy "assignments read" on public.assignments for select to authenticated
  using (is_class_teacher(class_id) or is_class_member(class_id));
create policy "assignments write" on public.assignments for all to authenticated
  using (is_class_teacher(class_id)) with check (is_class_teacher(class_id));

revoke all on all tables in schema public from anon;

-- ---------- Функцияларға рұқсат ----------

revoke execute on all functions in schema public from public, anon;
grant execute on function public.class_preview(text)              to anon, authenticated;
grant execute on function public.login_available(text)            to anon, authenticated;
grant execute on function public.create_class(text)               to authenticated;
grant execute on function public.class_roster(uuid)               to authenticated;
grant execute on function public.reset_student_password(uuid, text) to authenticated;
grant execute on function public.join_class(text)                 to authenticated;
grant execute on function public.my_classes()                     to authenticated;
grant execute on function public.is_class_teacher(uuid)           to authenticated;
grant execute on function public.is_class_member(uuid)            to authenticated;
grant execute on function public.is_teacher_of(uuid)              to authenticated;
grant execute on function public.is_my_teacher(uuid)              to authenticated;
grant execute on function public.my_role()                        to authenticated;
