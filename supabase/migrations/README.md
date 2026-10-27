# Migrations

## Data API grants (Supabase change effective 2026-10-30)

Supabase no longer auto-grants Data API access to tables created in `public` from 2026-10-30.
Tables that already exist in the production project keep their grants.

Any migration that creates a table in `public` must grant access in the same file,
otherwise supabase-js returns `permission denied`:

```sql
grant select, insert, update, delete on public.<table> to authenticated;
grant select, insert, update, delete on public.<table> to service_role;
-- only if anonymous visitors must read it:
-- grant select on public.<table> to anon;
```

Keep RLS enabled on every table; grants only open the API path, RLS still decides which rows a user sees.

This also applies when the schema is recreated from these files (new project, preview branch,
`supabase db reset`): `0001_initial_schema.sql` predates the change and has no table grants,
so add them before recreating the schema. `0002_harden_profiles.sql` narrows `profiles`
to column-level grants; keep that narrower grant for `profiles` instead of a table-wide one.
