--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
-- Name: handle_new_profile_defaults(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_profile_defaults() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO public.categories (user_id, name, color, sort_order) VALUES
    (NEW.id, '開発', '#3B82F6', 1), (NEW.id, 'デザイン', '#8B5CF6', 2),
    (NEW.id, 'ライティング', '#10B981', 3), (NEW.id, '動画', '#F59E0B', 4),
    (NEW.id, 'その他', '#6B7280', 5)
  ON CONFLICT (user_id, name) DO NOTHING;
  INSERT INTO public.tags (user_id, name, color) VALUES
    (NEW.id, '企業', '#3B82F6'), (NEW.id, '個人', '#10B981'), (NEW.id, '定期', '#F59E0B')
  ON CONFLICT (user_id, name) DO NOTHING;
  RETURN NEW;
END;
$$;


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'display_name', ''))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;


--
-- Name: update_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.categories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    name text NOT NULL,
    color text DEFAULT '#3B82F6'::text NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: client_tags; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.client_tags (
    client_id uuid NOT NULL,
    tag_id uuid NOT NULL
);


--
-- Name: clients; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.clients (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    name text NOT NULL,
    company_name text,
    email text,
    phone text,
    memo text,
    is_archived boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: notices; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notices (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    author_id uuid,
    title text NOT NULL,
    body text NOT NULL,
    category text DEFAULT 'info'::text NOT NULL,
    status text DEFAULT 'draft'::text NOT NULL,
    published_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT notices_category_check CHECK ((category = ANY (ARRAY['info'::text, 'maintenance'::text, 'feature'::text]))),
    CONSTRAINT notices_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'published'::text])))
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    display_name text,
    business_name text,
    email text NOT NULL,
    plan text DEFAULT 'free'::text NOT NULL,
    role text DEFAULT 'user'::text NOT NULL,
    stripe_customer_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT profiles_plan_check CHECK ((plan = ANY (ARRAY['free'::text, 'pro'::text, 'pro_plus'::text]))),
    CONSTRAINT profiles_role_check CHECK ((role = ANY (ARRAY['user'::text, 'admin'::text])))
);


--
-- Name: projects; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.projects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    client_id uuid,
    category_id uuid,
    title text NOT NULL,
    status text DEFAULT 'in_progress'::text NOT NULL,
    amount numeric(12,0) DEFAULT 0 NOT NULL,
    deadline date,
    memo text,
    completed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT projects_amount_check CHECK ((amount >= (0)::numeric)),
    CONSTRAINT projects_status_check CHECK ((status = ANY (ARRAY['in_progress'::text, 'completed'::text, 'paid'::text, 'cancelled'::text])))
);


--
-- Name: revenue_entries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.revenue_entries (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    project_id uuid,
    amount numeric(12,0) NOT NULL,
    payment_status text DEFAULT 'unbilled'::text NOT NULL,
    billed_date date,
    due_date date,
    paid_date date,
    memo text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT revenue_entries_amount_check CHECK ((amount > (0)::numeric)),
    CONSTRAINT revenue_entries_payment_status_check CHECK ((payment_status = ANY (ARRAY['unbilled'::text, 'billed'::text, 'paid'::text])))
);


--
-- Name: tags; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tags (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    name text NOT NULL,
    color text DEFAULT '#6B7280'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: v_monthly_revenue; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.v_monthly_revenue AS
 SELECT user_id,
    (date_trunc('month'::text, (COALESCE(billed_date, (created_at)::date))::timestamp with time zone))::date AS month,
    sum(amount) AS total_revenue,
    sum(
        CASE
            WHEN (payment_status = 'paid'::text) THEN amount
            ELSE (0)::numeric
        END) AS paid_amount,
    count(*) AS entry_count
   FROM public.revenue_entries
  GROUP BY user_id, ((date_trunc('month'::text, (COALESCE(billed_date, (created_at)::date))::timestamp with time zone))::date);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: categories categories_user_id_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_user_id_name_key UNIQUE (user_id, name);


--
-- Name: client_tags client_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_tags
    ADD CONSTRAINT client_tags_pkey PRIMARY KEY (client_id, tag_id);


--
-- Name: clients clients_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_pkey PRIMARY KEY (id);


--
-- Name: notices notices_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notices
    ADD CONSTRAINT notices_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (id);


--
-- Name: revenue_entries revenue_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.revenue_entries
    ADD CONSTRAINT revenue_entries_pkey PRIMARY KEY (id);


--
-- Name: tags tags_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_pkey PRIMARY KEY (id);


--
-- Name: tags tags_user_id_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_user_id_name_key UNIQUE (user_id, name);


--
-- Name: idx_clients_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_clients_user ON public.clients USING btree (user_id);


--
-- Name: idx_clients_user_archived; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_clients_user_archived ON public.clients USING btree (user_id, is_archived);


--
-- Name: idx_clients_user_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_clients_user_name ON public.clients USING btree (user_id, name);


--
-- Name: idx_projects_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_projects_user ON public.projects USING btree (user_id);


--
-- Name: idx_projects_user_client; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_projects_user_client ON public.projects USING btree (user_id, client_id);


--
-- Name: idx_projects_user_deadline; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_projects_user_deadline ON public.projects USING btree (user_id, deadline);


--
-- Name: idx_projects_user_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_projects_user_status ON public.projects USING btree (user_id, status);


--
-- Name: idx_revenue_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_revenue_user ON public.revenue_entries USING btree (user_id);


--
-- Name: idx_revenue_user_due; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_revenue_user_due ON public.revenue_entries USING btree (user_id, due_date);


--
-- Name: idx_revenue_user_paid_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_revenue_user_paid_date ON public.revenue_entries USING btree (user_id, paid_date);


--
-- Name: idx_revenue_user_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_revenue_user_status ON public.revenue_entries USING btree (user_id, payment_status);


--
-- Name: clients clients_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


--
-- Name: notices notices_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER notices_updated_at BEFORE UPDATE ON public.notices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


--
-- Name: profiles on_profile_created; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER on_profile_created AFTER INSERT ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_new_profile_defaults();


--
-- Name: profiles profiles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


--
-- Name: projects projects_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


--
-- Name: revenue_entries revenue_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER revenue_updated_at BEFORE UPDATE ON public.revenue_entries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


--
-- Name: categories categories_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: client_tags client_tags_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_tags
    ADD CONSTRAINT client_tags_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;


--
-- Name: client_tags client_tags_tag_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_tags
    ADD CONSTRAINT client_tags_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES public.tags(id) ON DELETE CASCADE;


--
-- Name: clients clients_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: notices notices_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notices
    ADD CONSTRAINT notices_author_id_fkey FOREIGN KEY (author_id) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: profiles profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: projects projects_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL;


--
-- Name: projects projects_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: projects projects_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: revenue_entries revenue_entries_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.revenue_entries
    ADD CONSTRAINT revenue_entries_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE SET NULL;


--
-- Name: revenue_entries revenue_entries_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.revenue_entries
    ADD CONSTRAINT revenue_entries_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: tags tags_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: categories; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

--
-- Name: categories categories_delete_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY categories_delete_own ON public.categories FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: categories categories_insert_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY categories_insert_own ON public.categories FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: categories categories_select_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY categories_select_own ON public.categories FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: categories categories_update_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY categories_update_own ON public.categories FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: client_tags; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.client_tags ENABLE ROW LEVEL SECURITY;

--
-- Name: client_tags client_tags_delete_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY client_tags_delete_own ON public.client_tags FOR DELETE USING ((EXISTS ( SELECT 1
   FROM public.clients
  WHERE ((clients.id = client_tags.client_id) AND (clients.user_id = auth.uid())))));


--
-- Name: client_tags client_tags_insert_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY client_tags_insert_own ON public.client_tags FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.clients
  WHERE ((clients.id = client_tags.client_id) AND (clients.user_id = auth.uid())))));


--
-- Name: client_tags client_tags_select_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY client_tags_select_own ON public.client_tags FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.clients
  WHERE ((clients.id = client_tags.client_id) AND (clients.user_id = auth.uid())))));


--
-- Name: clients; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

--
-- Name: clients clients_delete_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY clients_delete_own ON public.clients FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: clients clients_insert_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY clients_insert_own ON public.clients FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: clients clients_select_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY clients_select_own ON public.clients FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: clients clients_update_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY clients_update_own ON public.clients FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: notices; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;

--
-- Name: notices notices_select_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY notices_select_all ON public.notices FOR SELECT USING (true);


--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles profiles_insert_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY profiles_insert_own ON public.profiles FOR INSERT WITH CHECK ((auth.uid() = id));


--
-- Name: profiles profiles_select_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY profiles_select_own ON public.profiles FOR SELECT USING ((auth.uid() = id));


--
-- Name: profiles profiles_update_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY profiles_update_own ON public.profiles FOR UPDATE USING ((auth.uid() = id));


--
-- Name: projects; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

--
-- Name: projects projects_delete_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY projects_delete_own ON public.projects FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: projects projects_insert_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY projects_insert_own ON public.projects FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: projects projects_select_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY projects_select_own ON public.projects FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: projects projects_update_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY projects_update_own ON public.projects FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: revenue_entries revenue_delete_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY revenue_delete_own ON public.revenue_entries FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: revenue_entries; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.revenue_entries ENABLE ROW LEVEL SECURITY;

--
-- Name: revenue_entries revenue_insert_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY revenue_insert_own ON public.revenue_entries FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: revenue_entries revenue_select_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY revenue_select_own ON public.revenue_entries FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: revenue_entries revenue_update_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY revenue_update_own ON public.revenue_entries FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: tags; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

--
-- Name: tags tags_delete_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tags_delete_own ON public.tags FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: tags tags_insert_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tags_insert_own ON public.tags FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: tags tags_select_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tags_select_own ON public.tags FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: tags tags_update_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tags_update_own ON public.tags FOR UPDATE USING ((auth.uid() = user_id));


--
-- PostgreSQL database dump complete
--



--
-- Auth hook: create a profile row whenever a Supabase auth user is created
--
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
