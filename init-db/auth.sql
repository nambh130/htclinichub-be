--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5 (Debian 17.5-1.pgdg120+1)
-- Dumped by pg_dump version 17.5 (Debian 17.5-1.pgdg120+1)

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
-- Name: auth_service; Type: DATABASE; Schema: -; Owner: postgres
--

CREATE DATABASE auth_service WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'en_US.utf8';


ALTER DATABASE auth_service OWNER TO postgres;

\connect auth_service

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
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: clinics_createdbytype_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.clinics_createdbytype_enum AS ENUM (
    'doctor',
    'employee',
    'patient',
    'admin'
);


ALTER TYPE public.clinics_createdbytype_enum OWNER TO postgres;

--
-- Name: clinics_deletedbytype_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.clinics_deletedbytype_enum AS ENUM (
    'doctor',
    'employee',
    'patient'
);


ALTER TYPE public.clinics_deletedbytype_enum OWNER TO postgres;

--
-- Name: clinics_updatedbytype_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.clinics_updatedbytype_enum AS ENUM (
    'doctor',
    'employee',
    'patient',
    'admin'
);


ALTER TYPE public.clinics_updatedbytype_enum OWNER TO postgres;

--
-- Name: employee_invitation_createdbytype_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.employee_invitation_createdbytype_enum AS ENUM (
    'doctor',
    'employee',
    'patient',
    'admin'
);


ALTER TYPE public.employee_invitation_createdbytype_enum OWNER TO postgres;

--
-- Name: employee_invitation_deletedbytype_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.employee_invitation_deletedbytype_enum AS ENUM (
    'doctor',
    'employee',
    'patient'
);


ALTER TYPE public.employee_invitation_deletedbytype_enum OWNER TO postgres;

--
-- Name: employee_invitation_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.employee_invitation_status_enum AS ENUM (
    'pending',
    'accepted',
    'expired',
    'revoked'
);


ALTER TYPE public.employee_invitation_status_enum OWNER TO postgres;

--
-- Name: employee_invitation_updatedbytype_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.employee_invitation_updatedbytype_enum AS ENUM (
    'doctor',
    'employee',
    'patient',
    'admin'
);


ALTER TYPE public.employee_invitation_updatedbytype_enum OWNER TO postgres;

--
-- Name: patient_createdbytype_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.patient_createdbytype_enum AS ENUM (
    'doctor',
    'employee',
    'patient',
    'admin'
);


ALTER TYPE public.patient_createdbytype_enum OWNER TO postgres;

--
-- Name: patient_deletedbytype_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.patient_deletedbytype_enum AS ENUM (
    'doctor',
    'employee',
    'patient'
);


ALTER TYPE public.patient_deletedbytype_enum OWNER TO postgres;

--
-- Name: patient_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.patient_status_enum AS ENUM (
    'active',
    'pending',
    'banned',
    'deleted'
);


ALTER TYPE public.patient_status_enum OWNER TO postgres;

--
-- Name: patient_updatedbytype_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.patient_updatedbytype_enum AS ENUM (
    'doctor',
    'employee',
    'patient',
    'admin'
);


ALTER TYPE public.patient_updatedbytype_enum OWNER TO postgres;

--
-- Name: permission_createdbytype_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.permission_createdbytype_enum AS ENUM (
    'doctor',
    'employee',
    'patient',
    'admin'
);


ALTER TYPE public.permission_createdbytype_enum OWNER TO postgres;

--
-- Name: permission_deletedbytype_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.permission_deletedbytype_enum AS ENUM (
    'doctor',
    'employee',
    'patient'
);


ALTER TYPE public.permission_deletedbytype_enum OWNER TO postgres;

--
-- Name: permission_updatedbytype_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.permission_updatedbytype_enum AS ENUM (
    'doctor',
    'employee',
    'patient',
    'admin'
);


ALTER TYPE public.permission_updatedbytype_enum OWNER TO postgres;

--
-- Name: refresh_tokens_createdbytype_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.refresh_tokens_createdbytype_enum AS ENUM (
    'doctor',
    'employee',
    'patient',
    'admin'
);


ALTER TYPE public.refresh_tokens_createdbytype_enum OWNER TO postgres;

--
-- Name: refresh_tokens_deletedbytype_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.refresh_tokens_deletedbytype_enum AS ENUM (
    'doctor',
    'employee',
    'patient'
);


ALTER TYPE public.refresh_tokens_deletedbytype_enum OWNER TO postgres;

--
-- Name: refresh_tokens_updatedbytype_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.refresh_tokens_updatedbytype_enum AS ENUM (
    'doctor',
    'employee',
    'patient',
    'admin'
);


ALTER TYPE public.refresh_tokens_updatedbytype_enum OWNER TO postgres;

--
-- Name: role_createdbytype_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.role_createdbytype_enum AS ENUM (
    'doctor',
    'employee',
    'patient',
    'admin'
);


ALTER TYPE public.role_createdbytype_enum OWNER TO postgres;

--
-- Name: role_deletedbytype_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.role_deletedbytype_enum AS ENUM (
    'doctor',
    'employee',
    'patient'
);


ALTER TYPE public.role_deletedbytype_enum OWNER TO postgres;

--
-- Name: role_role_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.role_role_type_enum AS ENUM (
    'doctor',
    'employee',
    'patient',
    'admin'
);


ALTER TYPE public.role_role_type_enum OWNER TO postgres;

--
-- Name: role_updatedbytype_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.role_updatedbytype_enum AS ENUM (
    'doctor',
    'employee',
    'patient',
    'admin'
);


ALTER TYPE public.role_updatedbytype_enum OWNER TO postgres;

--
-- Name: users_actor_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.users_actor_type_enum AS ENUM (
    'doctor',
    'employee',
    'patient',
    'admin'
);


ALTER TYPE public.users_actor_type_enum OWNER TO postgres;

--
-- Name: users_createdbytype_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.users_createdbytype_enum AS ENUM (
    'doctor',
    'employee',
    'patient',
    'admin'
);


ALTER TYPE public.users_createdbytype_enum OWNER TO postgres;

--
-- Name: users_deletedbytype_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.users_deletedbytype_enum AS ENUM (
    'doctor',
    'employee',
    'patient'
);


ALTER TYPE public.users_deletedbytype_enum OWNER TO postgres;

--
-- Name: users_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.users_status_enum AS ENUM (
    'active',
    'pending',
    'banned',
    'deleted'
);


ALTER TYPE public.users_status_enum OWNER TO postgres;

--
-- Name: users_updatedbytype_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.users_updatedbytype_enum AS ENUM (
    'doctor',
    'employee',
    'patient',
    'admin'
);


ALTER TYPE public.users_updatedbytype_enum OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: clinics; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.clinics (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "createdById" character varying,
    "createdByType" public.clinics_createdbytype_enum,
    "updatedById" character varying,
    "updatedByType" public.clinics_updatedbytype_enum,
    "deletedAt" timestamp without time zone,
    "deletedById" character varying,
    "deletedByType" public.clinics_deletedbytype_enum,
    "ownerId" uuid
);


ALTER TABLE public.clinics OWNER TO postgres;

--
-- Name: employee_invitation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.employee_invitation (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "createdById" character varying,
    "createdByType" public.employee_invitation_createdbytype_enum,
    "updatedById" character varying,
    "updatedByType" public.employee_invitation_updatedbytype_enum,
    "deletedAt" timestamp without time zone,
    "deletedById" character varying,
    "deletedByType" public.employee_invitation_deletedbytype_enum,
    email character varying(255) NOT NULL,
    hashed_token character varying(64) NOT NULL,
    is_owner_invitation boolean DEFAULT false NOT NULL,
    status public.employee_invitation_status_enum DEFAULT 'pending'::public.employee_invitation_status_enum NOT NULL,
    expires_at timestamp with time zone,
    clinic_id uuid NOT NULL,
    role_id uuid NOT NULL,
    invited_by uuid
);


ALTER TABLE public.employee_invitation OWNER TO postgres;

--
-- Name: patient; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.patient (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "createdById" character varying,
    "createdByType" public.patient_createdbytype_enum,
    "updatedById" character varying,
    "updatedByType" public.patient_updatedbytype_enum,
    "deletedAt" timestamp without time zone,
    "deletedById" character varying,
    "deletedByType" public.patient_deletedbytype_enum,
    phone character varying NOT NULL,
    status public.patient_status_enum DEFAULT 'active'::public.patient_status_enum NOT NULL,
    password character varying
);


ALTER TABLE public.patient OWNER TO postgres;

--
-- Name: permission; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.permission (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "createdById" character varying,
    "createdByType" public.permission_createdbytype_enum,
    "updatedById" character varying,
    "updatedByType" public.permission_updatedbytype_enum,
    "deletedAt" timestamp without time zone,
    "deletedById" character varying,
    "deletedByType" public.permission_deletedbytype_enum,
    name character varying NOT NULL,
    description character varying
);


ALTER TABLE public.permission OWNER TO postgres;

--
-- Name: refresh_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.refresh_tokens (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "createdById" character varying,
    "createdByType" public.refresh_tokens_createdbytype_enum,
    "updatedById" character varying,
    "updatedByType" public.refresh_tokens_updatedbytype_enum,
    "deletedAt" timestamp without time zone,
    "deletedById" character varying,
    "deletedByType" public.refresh_tokens_deletedbytype_enum,
    user_id character varying NOT NULL,
    token_hash character varying NOT NULL,
    selector character varying NOT NULL,
    user_agent character varying,
    ip_address character varying,
    expire_at timestamp without time zone NOT NULL
);


ALTER TABLE public.refresh_tokens OWNER TO postgres;

--
-- Name: role; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.role (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "createdById" character varying,
    "createdByType" public.role_createdbytype_enum,
    "updatedById" character varying,
    "updatedByType" public.role_updatedbytype_enum,
    "deletedAt" timestamp without time zone,
    "deletedById" character varying,
    "deletedByType" public.role_deletedbytype_enum,
    name character varying NOT NULL,
    description character varying,
    role_type public.role_role_type_enum NOT NULL
);


ALTER TABLE public.role OWNER TO postgres;

--
-- Name: role_permission; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.role_permission (
    role_id uuid NOT NULL,
    permission_id uuid NOT NULL
);


ALTER TABLE public.role_permission OWNER TO postgres;

--
-- Name: user_clinics; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_clinics (
    user_id uuid NOT NULL,
    clinic_id uuid NOT NULL
);


ALTER TABLE public.user_clinics OWNER TO postgres;

--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_roles (
    user_id uuid NOT NULL,
    permission_id uuid NOT NULL
);


ALTER TABLE public.user_roles OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "createdById" character varying,
    "createdByType" public.users_createdbytype_enum,
    "updatedById" character varying,
    "updatedByType" public.users_updatedbytype_enum,
    "deletedAt" timestamp without time zone,
    "deletedById" character varying,
    "deletedByType" public.users_deletedbytype_enum,
    email character varying(255) NOT NULL,
    actor_type public.users_actor_type_enum NOT NULL,
    password character varying(255) NOT NULL,
    status public.users_status_enum DEFAULT 'active'::public.users_status_enum NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Data for Name: clinics; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.clinics (id, "createdAt", "updatedAt", "createdById", "createdByType", "updatedById", "updatedByType", "deletedAt", "deletedById", "deletedByType", "ownerId") FROM stdin;
280f44f6-162e-401f-90b6-f51644c6f951	2025-08-03 14:50:54.922058	2025-08-03 14:50:54.922058	\N	\N	\N	\N	\N	\N	\N	256c8598-8834-4214-b24f-184dbc817ead
48804348-8656-4528-a069-8c3d3c8a1ea6	2025-08-03 14:52:03.317011	2025-08-03 14:52:03.317011	\N	\N	\N	\N	\N	\N	\N	cff1b9eb-a3ae-427d-a97b-e542257be9cb
de55a5b0-ea89-4099-a51e-ca2213c89951	2025-08-03 14:52:40.312973	2025-08-03 14:52:40.312973	\N	\N	\N	\N	\N	\N	\N	\N
ac0634ad-93e6-43e4-903b-e4f4e4b589a2	2025-08-03 14:54:00.137818	2025-08-03 14:54:00.137818	\N	\N	\N	\N	\N	\N	\N	3bf90824-6cc3-4ce4-b30e-0a088c7817a8
2007befe-eabb-4c2b-9844-2280680130f5	2025-08-03 15:00:54.508936	2025-08-03 15:00:54.508936	\N	\N	\N	\N	\N	\N	\N	f164c821-99be-4ec5-83cb-5dbcd2a1f898
\.


--
-- Data for Name: employee_invitation; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.employee_invitation (id, "createdAt", "updatedAt", "createdById", "createdByType", "updatedById", "updatedByType", "deletedAt", "deletedById", "deletedByType", email, hashed_token, is_owner_invitation, status, expires_at, clinic_id, role_id, invited_by) FROM stdin;
b53d35fe-1601-4808-abd0-14268b78cddb	2025-08-13 21:46:55.180479	2025-08-13 21:46:55.180479	256c8598-8834-4214-b24f-184dbc817ead	doctor	\N	\N	\N	\N	\N	jackfrost8520@gmail.com	851654694c4ceaff0ab059cfc864e028ef317a7489dcfd76664fa96a2d4f5d37	f	pending	2025-08-20 21:46:55.175+00	280f44f6-162e-401f-90b6-f51644c6f951	1ead5e0f-3a99-4e72-8506-d3c6bfcba8f6	\N
cc3ed558-e340-42e6-9bf5-1eabe57d20b5	2025-08-13 21:47:24.507462	2025-08-13 21:47:24.507462	256c8598-8834-4214-b24f-184dbc817ead	doctor	\N	\N	\N	\N	\N	jackfrost8520@gmail.com	54f18c4034bfd9ddb67668a08392cf7be42ec7c88d81bca59a9147ce472c96b6	f	pending	2025-08-20 21:47:24.506+00	280f44f6-162e-401f-90b6-f51644c6f951	b53d20ac-7de4-48ef-8eff-c756195f89df	\N
3e168ddd-469e-47ec-bc8f-92c240091f18	2025-08-14 08:31:04.915551	2025-08-14 08:34:47.830202	256c8598-8834-4214-b24f-184dbc817ead	doctor	\N	\N	\N	\N	\N	jackfrost8520@gmail.com	6864b9d9f25b3efe3148e60a1871563c7d3d2ee63f4784b19ca5d71bff099445	f	accepted	2025-08-21 08:31:04.914+00	280f44f6-162e-401f-90b6-f51644c6f951	1ead5e0f-3a99-4e72-8506-d3c6bfcba8f6	\N
d33431b3-ee49-44ca-a292-56ece2ee1fca	2025-08-14 08:36:58.712598	2025-08-14 08:36:58.712598	256c8598-8834-4214-b24f-184dbc817ead	doctor	\N	\N	\N	\N	\N	jackfrost8520@gmail.com	5c07a74486c6ad30cca0656cee0d0535c93d2f4c2679b15ea0b39c12b17ab6d3	f	pending	2025-08-21 08:36:58.712+00	280f44f6-162e-401f-90b6-f51644c6f951	b53d20ac-7de4-48ef-8eff-c756195f89df	\N
5528a429-4f32-40a6-9eb0-b15f95efef68	2025-08-14 09:08:16.194472	2025-08-14 09:08:16.194472	256c8598-8834-4214-b24f-184dbc817ead	doctor	\N	\N	\N	\N	\N	abc@gmail.com	96b9b18c4570940fe701383d093e58f4ef0ebc22bb3101c9144c107ddbf03837	f	pending	2025-08-21 09:08:16.193+00	280f44f6-162e-401f-90b6-f51644c6f951	1ead5e0f-3a99-4e72-8506-d3c6bfcba8f6	\N
9139ba3b-a21b-4573-8da1-745e7f7df448	2025-08-14 10:17:27.745502	2025-08-14 10:17:27.745502	256c8598-8834-4214-b24f-184dbc817ead	doctor	\N	\N	\N	\N	\N	jackfrost85210@gmail.com	108f6c3d7b6b801073d9aec60ae5a5c188690eb263448f7ada55dc706678f302	f	pending	2025-08-21 10:17:27.745+00	280f44f6-162e-401f-90b6-f51644c6f951	1ead5e0f-3a99-4e72-8506-d3c6bfcba8f6	\N
29e67948-8409-4f20-b517-b185432d2d08	2025-08-14 10:27:36.750832	2025-08-14 10:27:36.750832	256c8598-8834-4214-b24f-184dbc817ead	doctor	\N	\N	\N	\N	\N	abc@gmail.com	e7c5286f0bdc5210f92f7733860bdc3a81d4b14f49e6571d975a27ba4c031b36	f	pending	2025-08-21 10:27:36.75+00	280f44f6-162e-401f-90b6-f51644c6f951	1ead5e0f-3a99-4e72-8506-d3c6bfcba8f6	\N
\.


--
-- Data for Name: patient; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.patient (id, "createdAt", "updatedAt", "createdById", "createdByType", "updatedById", "updatedByType", "deletedAt", "deletedById", "deletedByType", phone, status, password) FROM stdin;
f617d77f-4cd9-4938-8b79-a8a2bb0854ac	2025-08-03 12:05:05.256976	2025-08-03 12:05:05.256976	\N	\N	\N	\N	\N	\N	\N	0969565203	active	\N
10d4fa98-0e74-4260-be20-cea73a484cd7	2025-08-03 16:18:50.75207	2025-08-03 16:18:50.75207	\N	\N	\N	\N	\N	\N	\N	0365159522	active	\N
ca91c9cc-84b0-4ce7-a110-f7f562d96a39	2025-08-15 21:33:24.633195	2025-08-15 21:33:24.633195	\N	\N	\N	\N	\N	\N	\N	0364119018	active	\N
\.


--
-- Data for Name: permission; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.permission (id, "createdAt", "updatedAt", "createdById", "createdByType", "updatedById", "updatedByType", "deletedAt", "deletedById", "deletedByType", name, description) FROM stdin;
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.refresh_tokens (id, "createdAt", "updatedAt", "createdById", "createdByType", "updatedById", "updatedByType", "deletedAt", "deletedById", "deletedByType", user_id, token_hash, selector, user_agent, ip_address, expire_at) FROM stdin;
8b845563-8822-44d3-886a-a45e7b0f46d2	2025-08-03 13:24:57.105156	2025-08-03 13:24:57.105156	\N	\N	\N	\N	\N	\N	\N	8a52a315-04ee-4873-8b5a-cb32af73555b	$argon2id$v=19$m=65536,t=3,p=4$mTjs3mGntCbA7NzHKWCRkA$TIgnLxOhjxNEqNtxQ2j2TV55KYDOMUtwzHGOHM34tuY	c6459267cfd76f010fcc30ce8e805028	axios/1.10.0	::ffff:172.18.0.14	2025-08-10 13:24:57.079
cf8722f3-3dc5-4612-9669-cd70333ebe1c	2025-08-03 15:51:14.671193	2025-08-03 15:51:14.671193	\N	\N	\N	\N	\N	\N	\N	8c1225c5-38fc-41ca-a7bf-7c3bf3ce483a	$argon2id$v=19$m=65536,t=3,p=4$dZDdTg1XMToGz4KpItJ3wg$L5XNqK7nj2uPwRxua9pULM/81vOyaQqaoswwkq7UWrY	f0445b7994959c74c5cb120abcb9b412	axios/1.10.0	::ffff:172.18.0.9	2025-08-10 15:51:14.655
16a1038b-3940-405a-8602-ae0194ec9516	2025-08-03 16:23:10.355807	2025-08-03 16:23:10.355807	\N	\N	\N	\N	\N	\N	\N	256c8598-8834-4214-b24f-184dbc817ead	$argon2id$v=19$m=65536,t=3,p=4$sMA1FSC4EWQJxaGW3ceRtQ$yuq9bniOpmkgHrNz90LMYhXh4Umcp9C0pQKqnBHB+kw	7587a2f5637f44e2ee748373963a8711	axios/1.10.0	::ffff:172.18.0.9	2025-08-10 16:23:10.353
8c9afd34-551a-4873-95c4-9a3c081035e6	2025-08-22 20:39:41.17553	2025-08-22 20:39:41.17553	\N	\N	\N	\N	\N	\N	\N	256c8598-8834-4214-b24f-184dbc817ead	$argon2id$v=19$m=65536,t=3,p=4$0JLcfAu3AVjKEI0yiJsW1w$iwW2bdr1khdPkFIRV6K/61/HTFCQshejbqrQMpeowIo	221d3533e55a682d42d82bcdc6bb5d5a	axios/1.10.0	::ffff:172.18.0.6	2025-08-29 20:39:41.171
62701aeb-4929-4d59-852c-d40b4936a18b	2025-08-14 11:04:17.736588	2025-08-14 11:04:17.736588	\N	\N	\N	\N	\N	\N	\N	44c41a69-603f-49aa-ab5e-fcf2fbd234cd	$argon2id$v=19$m=65536,t=3,p=4$9/6rX6I7a0svtqyjrNSong$vsEn46w3Gll59lwRWFCsUF8d0wr+WTJNzAis3yVFVdU	a5c84dc4442f58ca83db8bfcddf24303	axios/1.10.0	::ffff:172.18.0.14	2025-08-21 11:04:17.734
5defefd3-47df-4a60-986d-f07ecbdff0ce	2025-08-14 11:41:44.361469	2025-08-14 11:41:44.361469	\N	\N	\N	\N	\N	\N	\N	498fe85e-8f2d-410c-b6a5-a9fbef6b12aa	$argon2id$v=19$m=65536,t=3,p=4$7WrzfBKBwEZtEYZDYn1+ng$QnXBVCyjgJDMv6H2QReOmK+76sm9wHk9RqOAWvsXN3M	7e18f346f863466449bf33b581a9150a	axios/1.10.0	::ffff:172.18.0.14	2025-08-21 11:41:44.359
05cf5c51-2c5a-4526-adbe-333e2817b543	2025-08-14 11:45:02.289607	2025-08-14 11:45:02.289607	\N	\N	\N	\N	\N	\N	\N	498fe85e-8f2d-410c-b6a5-a9fbef6b12aa	$argon2id$v=19$m=65536,t=3,p=4$8PUgJKFIzHDGLqtTFaL49w$2BvyCJOm1CqPcDK7xq3BXbdtSXyfCCB/klDE04rEC7Q	807f7df1d2eabea797f9d7307a128afd	axios/1.10.0	::ffff:172.18.0.14	2025-08-21 11:45:02.288
b6c061d0-e69d-425c-a436-e5ae18474e41	2025-08-14 11:51:07.874807	2025-08-14 11:51:07.874807	\N	\N	\N	\N	\N	\N	\N	256c8598-8834-4214-b24f-184dbc817ead	$argon2id$v=19$m=65536,t=3,p=4$JiCxzGkha8seWlX/fDz74w$i7RpX0tEMnu4mUz2UJKU3gvAD1lPcVpuEyDAupMMTos	010189be4ded3701cc8ee058150a1986	axios/1.10.0	::ffff:172.18.0.14	2025-08-21 11:51:07.873
9cce8070-6352-4219-ba0b-065dab3ecf94	2025-08-14 21:00:16.020738	2025-08-14 21:00:16.020738	\N	\N	\N	\N	\N	\N	\N	498fe85e-8f2d-410c-b6a5-a9fbef6b12aa	$argon2id$v=19$m=65536,t=3,p=4$FBtr0sAI5HENFR0fWCmDyg$8qWr/j3K0YG/M4MI9na9WhhFvZFObbkzTEap/QaC678	1ec3a63611b0721c928c4b84dbea1d50	axios/1.10.0	::ffff:172.18.0.14	2025-08-21 21:00:16.019
df8935c4-d4cf-46b2-a275-636415060591	2025-08-14 21:01:03.510521	2025-08-14 21:01:03.510521	\N	\N	\N	\N	\N	\N	\N	498fe85e-8f2d-410c-b6a5-a9fbef6b12aa	$argon2id$v=19$m=65536,t=3,p=4$14B+an4UTZnC6rwzs9bwHw$ZblMcWX3zbGfuMJLMJmHGzIl1uKhwT3NCGP0fG3J04A	4ca7a30b2da525f399885abe61057e7f	axios/1.10.0	::ffff:172.18.0.14	2025-08-21 21:01:03.509
7172bdfd-a94e-4c46-ba19-109d863d55a5	2025-08-14 21:03:40.057992	2025-08-14 21:03:40.057992	\N	\N	\N	\N	\N	\N	\N	498fe85e-8f2d-410c-b6a5-a9fbef6b12aa	$argon2id$v=19$m=65536,t=3,p=4$BXgJe8Ep/zzyk+jvgC7buQ$X4Wk+VGznqJrpDtCjuk/VvA+Ba9JRxYO4Nw3wjyfWZ0	aa74eb25ef10b67a1d5124ffa66dae88	axios/1.10.0	::ffff:172.18.0.14	2025-08-21 21:03:40.056
1f79d3fa-0c62-4bc3-819e-573dcfff2caa	2025-08-14 21:07:03.857088	2025-08-14 21:07:03.857088	\N	\N	\N	\N	\N	\N	\N	44c41a69-603f-49aa-ab5e-fcf2fbd234cd	$argon2id$v=19$m=65536,t=3,p=4$RZ1HCCZipdU+ju6hF5QwBA$FJM0/30piPCz1tUMiVW+jvk79+NyLmbkwncC8IG+1Fk	06ec993f432d4a5eab02f131bd5138e8	axios/1.10.0	::ffff:172.18.0.14	2025-08-21 21:07:03.855
1979362f-2023-466c-837e-679db45724bc	2025-08-15 21:31:13.339622	2025-08-15 21:31:13.339622	\N	\N	\N	\N	\N	\N	\N	44c41a69-603f-49aa-ab5e-fcf2fbd234cd	$argon2id$v=19$m=65536,t=3,p=4$U2xvt/AOudFDVXD139+8/w$CqyjON0cprGP4fzYGwa0IST9z0ZhWty+DOU6CGUPMvY	e421f1cee5ce9fd0126755c7e3646c29	axios/1.10.0	::ffff:172.18.0.7	2025-08-22 21:31:13.337
0850bccf-e652-4dde-bc87-37fcd3ff41e0	2025-08-15 19:34:36.360197	2025-08-15 19:34:36.360197	\N	\N	\N	\N	\N	\N	\N	256c8598-8834-4214-b24f-184dbc817ead	$argon2id$v=19$m=65536,t=3,p=4$aXJoxuMq9HQ2j8424x9MhQ$iVBx+TEIx57t55KrAYwnIAycBG7Bx75SDpeu2YhBtJo	f6f6345bdb80064f43b033363c6897fd	axios/1.10.0	::ffff:172.18.0.7	2025-08-22 19:34:36.342
423f1a9c-f71a-4fa3-92bb-a68bb32051f5	2025-08-15 19:36:38.376913	2025-08-15 19:36:38.376913	\N	\N	\N	\N	\N	\N	\N	256c8598-8834-4214-b24f-184dbc817ead	$argon2id$v=19$m=65536,t=3,p=4$7nbC9D1fNF6N6pfXcAcPAA$aEWrxxsaK+d1Lnsar7FXjOcb+WaWg+PZQihV3cGrTGk	b92f8ad67c9854608f1c937c8e77ceef	axios/1.10.0	::ffff:172.18.0.7	2025-08-22 19:36:38.363
33c1926f-9b16-4373-bd93-59a9dd1e40e9	2025-08-15 19:45:24.244666	2025-08-15 19:45:24.244666	\N	\N	\N	\N	\N	\N	\N	256c8598-8834-4214-b24f-184dbc817ead	$argon2id$v=19$m=65536,t=3,p=4$qKPIu3aH7t966drBRU1ELA$KxCFo5Hmto5STg+vNcTzgOo56ZZHuH2SVWIBRrPyWSY	3db90bab87afe1b91056588e1e832cec	axios/1.10.0	::ffff:172.18.0.7	2025-08-22 19:45:24.233
75d8dcfc-5a69-4348-b975-b150005870de	2025-08-17 19:31:40.502408	2025-08-17 19:31:40.502408	\N	\N	\N	\N	\N	\N	\N	256c8598-8834-4214-b24f-184dbc817ead	$argon2id$v=19$m=65536,t=3,p=4$fcADBjZF1AFY8WSmAlO1TA$Jnz3Xfs2KW1/5oGgVzwz6dO73NP7CewGXCfv3UCbg3g	8e0f3294c5363a2cdf9d3a7b21780cee	axios/1.10.0	::ffff:172.18.0.5	2025-08-24 19:31:40.487
\.


--
-- Data for Name: role; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.role (id, "createdAt", "updatedAt", "createdById", "createdByType", "updatedById", "updatedByType", "deletedAt", "deletedById", "deletedByType", name, description, role_type) FROM stdin;
441ae815-ed58-4ac6-8403-0aa15ee3e152	2025-08-03 13:10:40.730114	2025-08-03 13:10:40.730114	\N	\N	\N	\N	\N	\N	\N	admin	fix people (Physically)	admin
1ead5e0f-3a99-4e72-8506-d3c6bfcba8f6	2025-08-03 14:36:20.201803	2025-08-03 14:36:20.201803	\N	\N	\N	\N	\N	\N	\N	doctor	fix people (Physically)	doctor
b53d20ac-7de4-48ef-8eff-c756195f89df	2025-08-03 15:58:53.841884	2025-08-03 15:58:53.841884	\N	\N	\N	\N	\N	\N	\N	employee	fix people (Physically)	employee
0d5d8e0d-9447-4a1d-8085-1f4b6e2f838c	2025-08-14 08:43:55.49978	2025-08-14 08:43:55.49978	\N	\N	\N	\N	\N	\N	\N	nurse	fix people (Physically)	employee
5f4434c4-69dd-4f0b-8748-2582140732c8	2025-08-14 08:44:35.741901	2025-08-14 08:44:35.741901	\N	\N	\N	\N	\N	\N	\N	staff	fix people (Physically)	employee
063c622e-a4f0-4ee1-ba8e-a6f7f2faf108	2025-08-14 08:44:58.565	2025-08-14 08:44:58.565	\N	\N	\N	\N	\N	\N	\N	labtech	fix people (Physically)	employee
\.


--
-- Data for Name: role_permission; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.role_permission (role_id, permission_id) FROM stdin;
\.


--
-- Data for Name: user_clinics; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_clinics (user_id, clinic_id) FROM stdin;
3acfda41-60ab-47f7-913f-c7cfba771661	280f44f6-162e-401f-90b6-f51644c6f951
\.


--
-- Data for Name: user_roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_roles (user_id, permission_id) FROM stdin;
8a52a315-04ee-4873-8b5a-cb32af73555b	441ae815-ed58-4ac6-8403-0aa15ee3e152
256c8598-8834-4214-b24f-184dbc817ead	1ead5e0f-3a99-4e72-8506-d3c6bfcba8f6
cff1b9eb-a3ae-427d-a97b-e542257be9cb	1ead5e0f-3a99-4e72-8506-d3c6bfcba8f6
f164c821-99be-4ec5-83cb-5dbcd2a1f898	1ead5e0f-3a99-4e72-8506-d3c6bfcba8f6
3bf90824-6cc3-4ce4-b30e-0a088c7817a8	1ead5e0f-3a99-4e72-8506-d3c6bfcba8f6
eea256ac-2817-4b7d-84a1-c50c83ac95b1	1ead5e0f-3a99-4e72-8506-d3c6bfcba8f6
5b7c50b4-5f75-4fe9-9abf-d1ce98136141	1ead5e0f-3a99-4e72-8506-d3c6bfcba8f6
76eff7b6-bb57-49aa-8ccc-5a2f63af12a0	1ead5e0f-3a99-4e72-8506-d3c6bfcba8f6
d2198f5a-b3aa-4687-880b-a04bf1d57e18	1ead5e0f-3a99-4e72-8506-d3c6bfcba8f6
8c1225c5-38fc-41ca-a7bf-7c3bf3ce483a	1ead5e0f-3a99-4e72-8506-d3c6bfcba8f6
89480d8a-2da5-4404-aee9-24b24d767718	1ead5e0f-3a99-4e72-8506-d3c6bfcba8f6
31856b47-4b85-4863-bdcc-54cd4f4d8442	b53d20ac-7de4-48ef-8eff-c756195f89df
cc2bd164-4ce0-4d72-82fa-2c07774519b4	b53d20ac-7de4-48ef-8eff-c756195f89df
c079181f-d587-41b2-b248-216bc9b6fdff	b53d20ac-7de4-48ef-8eff-c756195f89df
55c989df-f3ff-4bbf-b0d1-6846dfd768ba	b53d20ac-7de4-48ef-8eff-c756195f89df
3acfda41-60ab-47f7-913f-c7cfba771661	1ead5e0f-3a99-4e72-8506-d3c6bfcba8f6
498fe85e-8f2d-410c-b6a5-a9fbef6b12aa	5f4434c4-69dd-4f0b-8748-2582140732c8
311b7ed4-6f35-4bf8-b713-ac16fb368a74	063c622e-a4f0-4ee1-ba8e-a6f7f2faf108
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, "createdAt", "updatedAt", "createdById", "createdByType", "updatedById", "updatedByType", "deletedAt", "deletedById", "deletedByType", email, actor_type, password, status) FROM stdin;
8a52a315-04ee-4873-8b5a-cb32af73555b	2025-08-03 13:11:10.121321	2025-08-03 13:11:10.121321	\N	\N	\N	\N	\N	\N	\N	admin@gmail.com	admin	$2b$12$dvU/OTOebuCMVXlK.BoTieC0sJA4Q8kMKVTEHAto///DcZF.HRvBO	active
256c8598-8834-4214-b24f-184dbc817ead	2025-08-03 14:36:30.157747	2025-08-03 14:36:30.157747	\N	\N	\N	\N	\N	\N	\N	nguyenvanan@gmail.com	doctor	$2b$12$qHtAhQce4oY0ol/lXceWfu8jWskqRgy3FbTCB/uhCfochvxPwqqBC	active
cff1b9eb-a3ae-427d-a97b-e542257be9cb	2025-08-03 14:39:02.567378	2025-08-03 14:39:02.567378	\N	\N	\N	\N	\N	\N	\N	vanbinh@gmail.com	doctor	$2b$12$666lZzirMxYqM69N0nROeezlLvFXdDs4KzHIUfw1mAaRSf1MnkwSq	active
f164c821-99be-4ec5-83cb-5dbcd2a1f898	2025-08-03 14:40:39.981398	2025-08-03 14:40:39.981398	\N	\N	\N	\N	\N	\N	\N	congvan@hospital.com	doctor	$2b$12$WcepwOYJ4aiuWO5FbXDI1.Jyx2gEDXJit9601G3xXqvabF2jeNNre	active
3bf90824-6cc3-4ce4-b30e-0a088c7817a8	2025-08-03 14:42:18.715907	2025-08-03 14:42:18.715907	\N	\N	\N	\N	\N	\N	\N	nguyenvand@hospital.vn	doctor	$2b$12$2pP03GkEgG75Du0iJ/e8WeVpyJmCsWTxF/VwTOIEeRbSCs9Hs7Riq	active
eea256ac-2817-4b7d-84a1-c50c83ac95b1	2025-08-03 14:43:29.083703	2025-08-03 14:43:29.083703	\N	\N	\N	\N	\N	\N	\N	yen0908@hospital.vn	doctor	$2b$12$97w9Gx50K48rFPZnDAIKTOogGgq6lhFrAI26RsQEd/S0.9vGx/Egq	active
5b7c50b4-5f75-4fe9-9abf-d1ce98136141	2025-08-03 14:44:21.437581	2025-08-03 14:44:21.437581	\N	\N	\N	\N	\N	\N	\N	ductran@hospital.vn	doctor	$2b$12$H6TbYkPNk4hVvDUrQjn0Jeb0H0TSDa/EMONbfEPJvP0mULb7SmJEu	active
76eff7b6-bb57-49aa-8ccc-5a2f63af12a0	2025-08-03 14:45:18.454474	2025-08-03 14:45:18.454474	\N	\N	\N	\N	\N	\N	\N	giangtran@hospital.vn	doctor	$2b$12$KuunhinnQp3IIM.Eo/Iozu7jK/AXZJfjSzj/.HR7Dwlujrh1CG6ZC	active
d2198f5a-b3aa-4687-880b-a04bf1d57e18	2025-08-03 14:46:56.116535	2025-08-03 14:46:56.116535	\N	\N	\N	\N	\N	\N	\N	huyenvu@hospital.vn	doctor	$2b$12$SggAMsfAlC8K/.oCwKTKl.TY5t6Q1VKklNdj4yrJzloliziG4nVpu	active
8c1225c5-38fc-41ca-a7bf-7c3bf3ce483a	2025-08-03 14:48:02.696196	2025-08-03 14:48:02.696196	\N	\N	\N	\N	\N	\N	\N	khai123@hospital.vn	doctor	$2b$12$E.onN7DH3fqZNeO0i0lemOVWUrWndWhs7XIkz/VhPyNuy17ztSfkK	active
89480d8a-2da5-4404-aee9-24b24d767718	2025-08-03 14:49:03.182664	2025-08-03 14:49:03.182664	\N	\N	\N	\N	\N	\N	\N	lelien@hospital.vn	doctor	$2b$12$l3shfGeMpvIVJHH2B0MIceqkAuJNGq1gvx7ZlQOL9Hi51I6l5CFfO	active
31856b47-4b85-4863-bdcc-54cd4f4d8442	2025-08-03 16:01:30.554739	2025-08-03 16:01:30.554739	\N	\N	\N	\N	\N	\N	\N	maitran@gmail.com	employee	$2b$12$AhpOqrLG8mKijk2kc2x99u4bcRH8/H.bqmctImLGQ9N6vGBz2AeFe	active
cc2bd164-4ce0-4d72-82fa-2c07774519b4	2025-08-03 16:03:24.262224	2025-08-03 16:03:24.262224	\N	\N	\N	\N	\N	\N	\N	namlehoang@gmail.com	employee	$2b$12$rmJY9BPh33gb3KDAhCgjT.IL6G8Yx9MyFwqIsgSARqtLX07douqOO	active
c079181f-d587-41b2-b248-216bc9b6fdff	2025-08-03 16:04:30.141814	2025-08-03 16:04:30.141814	\N	\N	\N	\N	\N	\N	\N	huyphamquang@gmail.com	employee	$2b$12$jrzTME2CVdrU.n4yGaicluESOVL/G6UGz0QobZB/aY8Iy14C7K9pO	active
55c989df-f3ff-4bbf-b0d1-6846dfd768ba	2025-08-03 16:05:27.817952	2025-08-03 16:05:27.817952	\N	\N	\N	\N	\N	\N	\N	hanhdothi@gmail.com	employee	$2b$12$fO9Q3TpTVUaxstWhhTY.EuXObK78DKHV.lmnY30G6B2P/i0v/Rxqy	active
3acfda41-60ab-47f7-913f-c7cfba771661	2025-08-14 08:34:47.802897	2025-08-14 08:34:47.802897	\N	\N	\N	\N	\N	\N	\N	jackfrost8520@gmail.com	doctor	$2b$12$MMCILv28R0MgppMn5WtrJuHz56X2PziKy77ITeMi2D0OwcpGmXEhW	active
44c41a69-603f-49aa-ab5e-fcf2fbd234cd	2025-08-14 11:03:58.643631	2025-08-14 11:03:58.643631	\N	\N	\N	\N	\N	\N	\N	admin123@gmail.com	admin	$2b$12$EpdXSllyLNAcK7zE3KQUMeaHPoEY4MnM6GWOU6vYT6eomfKFYu/Fi	active
498fe85e-8f2d-410c-b6a5-a9fbef6b12aa	2025-08-14 11:05:08.292847	2025-08-14 11:05:08.292847	\N	\N	\N	\N	\N	\N	\N	nhanvien@gmail.com	employee	$2b$12$BdbRH.V4nclFmcvIppgOqOfCIpz/pKx6QRqkbC6yzBfUcdZeX/KMu	active
311b7ed4-6f35-4bf8-b713-ac16fb368a74	2025-08-14 21:07:44.983772	2025-08-14 21:07:44.983772	\N	\N	\N	\N	\N	\N	\N	lab@gmail.com	employee	$2b$12$ugLPEMIhgowNub787zHf7OyUaYW/6bogJJv0o4hgrX9UpB6Ju1w1y	active
\.


--
-- Name: employee_invitation PK_1445851aad616eb2870dc244d85; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_invitation
    ADD CONSTRAINT "PK_1445851aad616eb2870dc244d85" PRIMARY KEY (id);


--
-- Name: role_permission PK_19a94c31d4960ded0dcd0397759; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permission
    ADD CONSTRAINT "PK_19a94c31d4960ded0dcd0397759" PRIMARY KEY (role_id, permission_id);


--
-- Name: permission PK_3b8b97af9d9d8807e41e6f48362; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permission
    ADD CONSTRAINT "PK_3b8b97af9d9d8807e41e6f48362" PRIMARY KEY (id);


--
-- Name: clinics PK_5513b659e4d12b01a8ab3956abc; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clinics
    ADD CONSTRAINT "PK_5513b659e4d12b01a8ab3956abc" PRIMARY KEY (id);


--
-- Name: refresh_tokens PK_7d8bee0204106019488c4c50ffa; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT "PK_7d8bee0204106019488c4c50ffa" PRIMARY KEY (id);


--
-- Name: patient PK_8dfa510bb29ad31ab2139fbfb99; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patient
    ADD CONSTRAINT "PK_8dfa510bb29ad31ab2139fbfb99" PRIMARY KEY (id);


--
-- Name: users PK_a3ffb1c0c8416b9fc6f907b7433; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY (id);


--
-- Name: user_roles PK_a8315d28da4c9e7044302463e8d; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT "PK_a8315d28da4c9e7044302463e8d" PRIMARY KEY (user_id, permission_id);


--
-- Name: role PK_b36bcfe02fc8de3c57a8b2391c2; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role
    ADD CONSTRAINT "PK_b36bcfe02fc8de3c57a8b2391c2" PRIMARY KEY (id);


--
-- Name: user_clinics PK_df58577968b9471dd97c741689b; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_clinics
    ADD CONSTRAINT "PK_df58577968b9471dd97c741689b" PRIMARY KEY (user_id, clinic_id);


--
-- Name: patient UQ_62a22cef7d3cb875be95ffee3af; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patient
    ADD CONSTRAINT "UQ_62a22cef7d3cb875be95ffee3af" UNIQUE (phone);


--
-- Name: users UQ_66e3153a5b1f4d7331eb9967994; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "UQ_66e3153a5b1f4d7331eb9967994" UNIQUE (email, actor_type);


--
-- Name: employee_invitation UQ_8b524148b7612cca5267a53764b; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_invitation
    ADD CONSTRAINT "UQ_8b524148b7612cca5267a53764b" UNIQUE (hashed_token);


--
-- Name: IDX_0dc6a54f9bef29def00c4039bf; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_0dc6a54f9bef29def00c4039bf" ON public.user_clinics USING btree (user_id);


--
-- Name: IDX_3d0a7155eafd75ddba5a701336; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_3d0a7155eafd75ddba5a701336" ON public.role_permission USING btree (role_id);


--
-- Name: IDX_87b8888186ca9769c960e92687; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_87b8888186ca9769c960e92687" ON public.user_roles USING btree (user_id);


--
-- Name: IDX_8f3179ad19825945aee4b463b2; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_8f3179ad19825945aee4b463b2" ON public.user_roles USING btree (permission_id);


--
-- Name: IDX_a083644676487e98d69c7f8f47; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_a083644676487e98d69c7f8f47" ON public.user_clinics USING btree (clinic_id);


--
-- Name: IDX_e3a3ba47b7ca00fd23be4ebd6c; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_e3a3ba47b7ca00fd23be4ebd6c" ON public.role_permission USING btree (permission_id);


--
-- Name: user_clinics FK_0dc6a54f9bef29def00c4039bfc; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_clinics
    ADD CONSTRAINT "FK_0dc6a54f9bef29def00c4039bfc" FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: clinics FK_3117a13727ec3247fa47cc40e95; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clinics
    ADD CONSTRAINT "FK_3117a13727ec3247fa47cc40e95" FOREIGN KEY ("ownerId") REFERENCES public.users(id);


--
-- Name: role_permission FK_3d0a7155eafd75ddba5a7013368; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permission
    ADD CONSTRAINT "FK_3d0a7155eafd75ddba5a7013368" FOREIGN KEY (role_id) REFERENCES public.role(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: employee_invitation FK_528950921ece9fb9649f02588c8; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_invitation
    ADD CONSTRAINT "FK_528950921ece9fb9649f02588c8" FOREIGN KEY (clinic_id) REFERENCES public.clinics(id);


--
-- Name: user_roles FK_87b8888186ca9769c960e926870; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT "FK_87b8888186ca9769c960e926870" FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_roles FK_8f3179ad19825945aee4b463b2b; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT "FK_8f3179ad19825945aee4b463b2b" FOREIGN KEY (permission_id) REFERENCES public.role(id);


--
-- Name: employee_invitation FK_9e47fb4ef8da354b0f19147ff81; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_invitation
    ADD CONSTRAINT "FK_9e47fb4ef8da354b0f19147ff81" FOREIGN KEY (role_id) REFERENCES public.role(id);


--
-- Name: user_clinics FK_a083644676487e98d69c7f8f479; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_clinics
    ADD CONSTRAINT "FK_a083644676487e98d69c7f8f479" FOREIGN KEY (clinic_id) REFERENCES public.clinics(id);


--
-- Name: employee_invitation FK_b404f3048e9a0b2814f9807f943; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_invitation
    ADD CONSTRAINT "FK_b404f3048e9a0b2814f9807f943" FOREIGN KEY (invited_by) REFERENCES public.users(id);


--
-- Name: role_permission FK_e3a3ba47b7ca00fd23be4ebd6cf; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permission
    ADD CONSTRAINT "FK_e3a3ba47b7ca00fd23be4ebd6cf" FOREIGN KEY (permission_id) REFERENCES public.permission(id);


--
-- PostgreSQL database dump complete
--

