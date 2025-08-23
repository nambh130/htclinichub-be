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
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: clinic_createdbytype_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.clinic_createdbytype_enum AS ENUM (
    'doctor',
    'employee',
    'patient',
    'admin'
);


ALTER TYPE public.clinic_createdbytype_enum OWNER TO postgres;

--
-- Name: clinic_deletedbytype_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.clinic_deletedbytype_enum AS ENUM (
    'doctor',
    'employee',
    'patient'
);


ALTER TYPE public.clinic_deletedbytype_enum OWNER TO postgres;

--
-- Name: clinic_updatedbytype_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.clinic_updatedbytype_enum AS ENUM (
    'doctor',
    'employee',
    'patient',
    'admin'
);


ALTER TYPE public.clinic_updatedbytype_enum OWNER TO postgres;

--
-- Name: degree_createdbytype_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.degree_createdbytype_enum AS ENUM (
    'doctor',
    'employee',
    'patient',
    'admin'
);


ALTER TYPE public.degree_createdbytype_enum OWNER TO postgres;

--
-- Name: degree_deletedbytype_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.degree_deletedbytype_enum AS ENUM (
    'doctor',
    'employee',
    'patient'
);


ALTER TYPE public.degree_deletedbytype_enum OWNER TO postgres;

--
-- Name: degree_level; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.degree_level AS ENUM (
    'Undergraduate',
    'Master',
    'Doctorate',
    'Residency',
    'Specialist I',
    'Specialist II'
);


ALTER TYPE public.degree_level OWNER TO postgres;

--
-- Name: degree_updatedbytype_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.degree_updatedbytype_enum AS ENUM (
    'doctor',
    'employee',
    'patient',
    'admin'
);


ALTER TYPE public.degree_updatedbytype_enum OWNER TO postgres;

--
-- Name: doctor_clinic_maps_createdbytype_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.doctor_clinic_maps_createdbytype_enum AS ENUM (
    'doctor',
    'employee',
    'patient',
    'admin'
);


ALTER TYPE public.doctor_clinic_maps_createdbytype_enum OWNER TO postgres;

--
-- Name: doctor_clinic_maps_deletedbytype_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.doctor_clinic_maps_deletedbytype_enum AS ENUM (
    'doctor',
    'employee',
    'patient'
);


ALTER TYPE public.doctor_clinic_maps_deletedbytype_enum OWNER TO postgres;

--
-- Name: doctor_clinic_maps_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.doctor_clinic_maps_status_enum AS ENUM (
    'active',
    'blocked'
);


ALTER TYPE public.doctor_clinic_maps_status_enum OWNER TO postgres;

--
-- Name: doctor_clinic_maps_updatedbytype_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.doctor_clinic_maps_updatedbytype_enum AS ENUM (
    'doctor',
    'employee',
    'patient',
    'admin'
);


ALTER TYPE public.doctor_clinic_maps_updatedbytype_enum OWNER TO postgres;

--
-- Name: doctor_createdbytype_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.doctor_createdbytype_enum AS ENUM (
    'doctor',
    'employee',
    'patient',
    'admin'
);


ALTER TYPE public.doctor_createdbytype_enum OWNER TO postgres;

--
-- Name: doctor_deletedbytype_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.doctor_deletedbytype_enum AS ENUM (
    'doctor',
    'employee',
    'patient'
);


ALTER TYPE public.doctor_deletedbytype_enum OWNER TO postgres;

--
-- Name: doctor_service_link_createdbytype_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.doctor_service_link_createdbytype_enum AS ENUM (
    'doctor',
    'employee',
    'patient',
    'admin'
);


ALTER TYPE public.doctor_service_link_createdbytype_enum OWNER TO postgres;

--
-- Name: doctor_service_link_deletedbytype_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.doctor_service_link_deletedbytype_enum AS ENUM (
    'doctor',
    'employee',
    'patient'
);


ALTER TYPE public.doctor_service_link_deletedbytype_enum OWNER TO postgres;

--
-- Name: doctor_service_link_updatedbytype_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.doctor_service_link_updatedbytype_enum AS ENUM (
    'doctor',
    'employee',
    'patient',
    'admin'
);


ALTER TYPE public.doctor_service_link_updatedbytype_enum OWNER TO postgres;

--
-- Name: doctor_updatedbytype_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.doctor_updatedbytype_enum AS ENUM (
    'doctor',
    'employee',
    'patient',
    'admin'
);


ALTER TYPE public.doctor_updatedbytype_enum OWNER TO postgres;

--
-- Name: doctor_workshift_createdbytype_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.doctor_workshift_createdbytype_enum AS ENUM (
    'doctor',
    'employee',
    'patient',
    'admin'
);


ALTER TYPE public.doctor_workshift_createdbytype_enum OWNER TO postgres;

--
-- Name: doctor_workshift_deletedbytype_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.doctor_workshift_deletedbytype_enum AS ENUM (
    'doctor',
    'employee',
    'patient'
);


ALTER TYPE public.doctor_workshift_deletedbytype_enum OWNER TO postgres;

--
-- Name: doctor_workshift_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.doctor_workshift_status_enum AS ENUM (
    'available',
    'fully-booked',
    'cancelled'
);


ALTER TYPE public.doctor_workshift_status_enum OWNER TO postgres;

--
-- Name: doctor_workshift_updatedbytype_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.doctor_workshift_updatedbytype_enum AS ENUM (
    'doctor',
    'employee',
    'patient',
    'admin'
);


ALTER TYPE public.doctor_workshift_updatedbytype_enum OWNER TO postgres;

--
-- Name: employee_createdbytype_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.employee_createdbytype_enum AS ENUM (
    'doctor',
    'employee',
    'patient',
    'admin'
);


ALTER TYPE public.employee_createdbytype_enum OWNER TO postgres;

--
-- Name: employee_deletedbytype_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.employee_deletedbytype_enum AS ENUM (
    'doctor',
    'employee',
    'patient'
);


ALTER TYPE public.employee_deletedbytype_enum OWNER TO postgres;

--
-- Name: employee_role_link_createdbytype_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.employee_role_link_createdbytype_enum AS ENUM (
    'doctor',
    'employee',
    'patient',
    'admin'
);


ALTER TYPE public.employee_role_link_createdbytype_enum OWNER TO postgres;

--
-- Name: employee_role_link_deletedbytype_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.employee_role_link_deletedbytype_enum AS ENUM (
    'doctor',
    'employee',
    'patient'
);


ALTER TYPE public.employee_role_link_deletedbytype_enum OWNER TO postgres;

--
-- Name: employee_role_link_updatedbytype_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.employee_role_link_updatedbytype_enum AS ENUM (
    'doctor',
    'employee',
    'patient',
    'admin'
);


ALTER TYPE public.employee_role_link_updatedbytype_enum OWNER TO postgres;

--
-- Name: employee_updatedbytype_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.employee_updatedbytype_enum AS ENUM (
    'doctor',
    'employee',
    'patient',
    'admin'
);


ALTER TYPE public.employee_updatedbytype_enum OWNER TO postgres;

--
-- Name: invitation_createdbytype_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.invitation_createdbytype_enum AS ENUM (
    'doctor',
    'employee',
    'patient',
    'admin'
);


ALTER TYPE public.invitation_createdbytype_enum OWNER TO postgres;

--
-- Name: invitation_deletedbytype_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.invitation_deletedbytype_enum AS ENUM (
    'doctor',
    'employee',
    'patient'
);


ALTER TYPE public.invitation_deletedbytype_enum OWNER TO postgres;

--
-- Name: invitation_updatedbytype_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.invitation_updatedbytype_enum AS ENUM (
    'doctor',
    'employee',
    'patient',
    'admin'
);


ALTER TYPE public.invitation_updatedbytype_enum OWNER TO postgres;

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
-- Name: service_createdbytype_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.service_createdbytype_enum AS ENUM (
    'doctor',
    'employee',
    'patient',
    'admin'
);


ALTER TYPE public.service_createdbytype_enum OWNER TO postgres;

--
-- Name: service_deletedbytype_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.service_deletedbytype_enum AS ENUM (
    'doctor',
    'employee',
    'patient'
);


ALTER TYPE public.service_deletedbytype_enum OWNER TO postgres;

--
-- Name: service_updatedbytype_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.service_updatedbytype_enum AS ENUM (
    'doctor',
    'employee',
    'patient',
    'admin'
);


ALTER TYPE public.service_updatedbytype_enum OWNER TO postgres;

--
-- Name: specialize_createdbytype_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.specialize_createdbytype_enum AS ENUM (
    'doctor',
    'employee',
    'patient',
    'admin'
);


ALTER TYPE public.specialize_createdbytype_enum OWNER TO postgres;

--
-- Name: specialize_deletedbytype_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.specialize_deletedbytype_enum AS ENUM (
    'doctor',
    'employee',
    'patient'
);


ALTER TYPE public.specialize_deletedbytype_enum OWNER TO postgres;

--
-- Name: specialize_updatedbytype_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.specialize_updatedbytype_enum AS ENUM (
    'doctor',
    'employee',
    'patient',
    'admin'
);


ALTER TYPE public.specialize_updatedbytype_enum OWNER TO postgres;

--
-- Name: staff_info_createdbytype_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.staff_info_createdbytype_enum AS ENUM (
    'doctor',
    'employee',
    'patient',
    'admin'
);


ALTER TYPE public.staff_info_createdbytype_enum OWNER TO postgres;

--
-- Name: staff_info_deletedbytype_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.staff_info_deletedbytype_enum AS ENUM (
    'doctor',
    'employee',
    'patient'
);


ALTER TYPE public.staff_info_deletedbytype_enum OWNER TO postgres;

--
-- Name: staff_info_updatedbytype_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.staff_info_updatedbytype_enum AS ENUM (
    'doctor',
    'employee',
    'patient',
    'admin'
);


ALTER TYPE public.staff_info_updatedbytype_enum OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: clinic; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.clinic (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "createdById" character varying,
    "createdByType" public.clinic_createdbytype_enum,
    "updatedById" character varying,
    "updatedByType" public.clinic_updatedbytype_enum,
    "deletedAt" timestamp without time zone,
    "deletedById" character varying,
    "deletedByType" public.clinic_deletedbytype_enum,
    name character varying(500) NOT NULL,
    location character varying(500) NOT NULL,
    phone character varying(15) NOT NULL,
    email character varying(255) NOT NULL,
    token character varying(255),
    "ownerId" uuid
);


ALTER TABLE public.clinic OWNER TO postgres;

--
-- Name: degree; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.degree (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "createdById" character varying,
    "createdByType" public.degree_createdbytype_enum,
    "updatedById" character varying,
    "updatedByType" public.degree_updatedbytype_enum,
    "deletedAt" timestamp without time zone,
    "deletedById" character varying,
    "deletedByType" public.degree_deletedbytype_enum,
    name character varying NOT NULL,
    description character varying,
    image_id character varying,
    staff_info_id uuid,
    level public.degree_level,
    institution character varying,
    year smallint,
    certificate_url character varying
);


ALTER TABLE public.degree OWNER TO postgres;

--
-- Name: doctor; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.doctor (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "createdById" character varying,
    "createdByType" public.doctor_createdbytype_enum,
    "updatedById" character varying,
    "updatedByType" public.doctor_updatedbytype_enum,
    "deletedAt" timestamp without time zone,
    "deletedById" character varying,
    "deletedByType" public.doctor_deletedbytype_enum,
    email character varying NOT NULL,
    password character varying NOT NULL,
    is_locked boolean DEFAULT false NOT NULL,
    staff_info_id uuid
);


ALTER TABLE public.doctor OWNER TO postgres;

--
-- Name: doctor_clinic_maps; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.doctor_clinic_maps (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "createdById" character varying,
    "createdByType" public.doctor_clinic_maps_createdbytype_enum,
    "updatedById" character varying,
    "updatedByType" public.doctor_clinic_maps_updatedbytype_enum,
    "deletedAt" timestamp without time zone,
    "deletedById" character varying,
    "deletedByType" public.doctor_clinic_maps_deletedbytype_enum,
    exam_fee integer,
    status public.doctor_clinic_maps_status_enum DEFAULT 'active'::public.doctor_clinic_maps_status_enum NOT NULL,
    doctor_id uuid,
    clinic_id uuid
);


ALTER TABLE public.doctor_clinic_maps OWNER TO postgres;

--
-- Name: doctor_service_link; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.doctor_service_link (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "createdById" character varying,
    "createdByType" public.doctor_service_link_createdbytype_enum,
    "updatedById" character varying,
    "updatedByType" public.doctor_service_link_updatedbytype_enum,
    "deletedAt" timestamp without time zone,
    "deletedById" character varying,
    "deletedByType" public.doctor_service_link_deletedbytype_enum,
    price numeric(10,2) NOT NULL,
    doctor_id uuid,
    service_id uuid
);


ALTER TABLE public.doctor_service_link OWNER TO postgres;

--
-- Name: doctor_workshift; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.doctor_workshift (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "createdById" character varying,
    "createdByType" public.doctor_workshift_createdbytype_enum,
    "updatedById" character varying,
    "updatedByType" public.doctor_workshift_updatedbytype_enum,
    "deletedAt" timestamp without time zone,
    "deletedById" character varying,
    "deletedByType" public.doctor_workshift_deletedbytype_enum,
    start_time timestamp without time zone NOT NULL,
    duration interval NOT NULL,
    status public.doctor_workshift_status_enum DEFAULT 'available'::public.doctor_workshift_status_enum NOT NULL,
    space integer DEFAULT 0 NOT NULL,
    doctor_clinic_link_id uuid NOT NULL
);


ALTER TABLE public.doctor_workshift OWNER TO postgres;

--
-- Name: employee; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.employee (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "createdById" character varying,
    "createdByType" public.employee_createdbytype_enum,
    "updatedById" character varying,
    "updatedByType" public.employee_updatedbytype_enum,
    "deletedAt" timestamp without time zone,
    "deletedById" character varying,
    "deletedByType" public.employee_deletedbytype_enum,
    email character varying NOT NULL,
    password character varying NOT NULL,
    clinic_id character varying,
    is_locked boolean DEFAULT false NOT NULL,
    staff_info_id uuid
);


ALTER TABLE public.employee OWNER TO postgres;

--
-- Name: employee_role_link; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.employee_role_link (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "createdById" character varying,
    "createdByType" public.employee_role_link_createdbytype_enum,
    "updatedById" character varying,
    "updatedByType" public.employee_role_link_updatedbytype_enum,
    "deletedAt" timestamp without time zone,
    "deletedById" character varying,
    "deletedByType" public.employee_role_link_deletedbytype_enum,
    employee_id uuid,
    role_id uuid
);


ALTER TABLE public.employee_role_link OWNER TO postgres;

--
-- Name: invitation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.invitation (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "createdById" character varying,
    "createdByType" public.invitation_createdbytype_enum,
    "updatedById" character varying,
    "updatedByType" public.invitation_updatedbytype_enum,
    "deletedAt" timestamp without time zone,
    "deletedById" character varying,
    "deletedByType" public.invitation_deletedbytype_enum,
    token character varying NOT NULL,
    doctor_id uuid
);


ALTER TABLE public.invitation OWNER TO postgres;

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
    description character varying NOT NULL
);


ALTER TABLE public.role OWNER TO postgres;

--
-- Name: service; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.service (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "createdById" character varying,
    "createdByType" public.service_createdbytype_enum,
    "updatedById" character varying,
    "updatedByType" public.service_updatedbytype_enum,
    "deletedAt" timestamp without time zone,
    "deletedById" character varying,
    "deletedByType" public.service_deletedbytype_enum,
    name character varying NOT NULL,
    description character varying NOT NULL,
    clinic_id character varying NOT NULL
);


ALTER TABLE public.service OWNER TO postgres;

--
-- Name: specialize; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.specialize (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "createdById" character varying,
    "createdByType" public.specialize_createdbytype_enum,
    "updatedById" character varying,
    "updatedByType" public.specialize_updatedbytype_enum,
    "deletedAt" timestamp without time zone,
    "deletedById" character varying,
    "deletedByType" public.specialize_deletedbytype_enum,
    name character varying NOT NULL,
    description character varying NOT NULL,
    image_id character varying,
    staff_info_id uuid,
    certificate_url character varying
);


ALTER TABLE public.specialize OWNER TO postgres;

--
-- Name: staff_info; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.staff_info (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "createdById" character varying,
    "createdByType" public.staff_info_createdbytype_enum,
    "updatedById" character varying,
    "updatedByType" public.staff_info_updatedbytype_enum,
    "deletedAt" timestamp without time zone,
    "deletedById" character varying,
    "deletedByType" public.staff_info_deletedbytype_enum,
    staff_id character varying NOT NULL,
    staff_type character varying NOT NULL,
    full_name character varying NOT NULL,
    dob date NOT NULL,
    phone character varying NOT NULL,
    gender character varying NOT NULL,
    "position" character varying NOT NULL,
    profile_img_id character varying,
    social_id character varying
);


ALTER TABLE public.staff_info OWNER TO postgres;

--
-- Data for Name: clinic; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.clinic (id, "createdAt", "updatedAt", "createdById", "createdByType", "updatedById", "updatedByType", "deletedAt", "deletedById", "deletedByType", name, location, phone, email, token, "ownerId") FROM stdin;
280f44f6-162e-401f-90b6-f51644c6f951	2025-08-03 14:50:54.895295	2025-08-03 14:50:54.895295	8a52a315-04ee-4873-8b5a-cb32af73555b	\N	\N	\N	\N	\N	\N	Phòng khám Thiện Tâm	103 Trường Chinh, Tân Bình, TP.HCM	0901341962	thientam@hospital.com	YWlwWtf8QJM_A132pNvCG6Oc6ajUtJ86	256c8598-8834-4214-b24f-184dbc817ead
48804348-8656-4528-a069-8c3d3c8a1ea6	2025-08-03 14:52:03.127414	2025-08-03 14:52:03.127414	8a52a315-04ee-4873-8b5a-cb32af73555b	\N	\N	\N	\N	\N	\N	Phòng khám Sức Khỏe Mới	45 Đường D2, Bình Thạnh, TP.HCM	0901950693	suckhoemoi@hospital.com	wiGzFyODgD5_XjWedX_-6GhXdYFj7kOZ	cff1b9eb-a3ae-427d-a97b-e542257be9cb
ac0634ad-93e6-43e4-903b-e4f4e4b589a2	2025-08-03 14:54:00.135985	2025-08-03 14:54:00.135985	8a52a315-04ee-4873-8b5a-cb32af73555b	\N	\N	\N	\N	\N	\N	Phòng khám Tâm An	12 Nguyễn Văn Linh, Quận 7, TP.HCM	0901673264	taman@clinic.com	csSWQavsrkIhSkRLWE7bS7q8MzHMmniz	3bf90824-6cc3-4ce4-b30e-0a088c7817a8
2007befe-eabb-4c2b-9844-2280680130f5	2025-08-03 15:00:54.515678	2025-08-03 15:00:54.515678	8a52a315-04ee-4873-8b5a-cb32af73555b	\N	\N	\N	\N	\N	\N	Phòng khám Ánh Dương	88 Lê Văn Sỹ, Quận 3, TP.HCM	0901283697	anhduong.clinic@gmail.com	_-lB0GeTOAwJyoU2IMv59loFrS-IU6RF	f164c821-99be-4ec5-83cb-5dbcd2a1f898
\.


--
-- Data for Name: degree; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.degree (id, "createdAt", "updatedAt", "createdById", "createdByType", "updatedById", "updatedByType", "deletedAt", "deletedById", "deletedByType", name, description, image_id, staff_info_id, level, institution, year, certificate_url) FROM stdin;
\.


--
-- Data for Name: doctor; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.doctor (id, "createdAt", "updatedAt", "createdById", "createdByType", "updatedById", "updatedByType", "deletedAt", "deletedById", "deletedByType", email, password, is_locked, staff_info_id) FROM stdin;
256c8598-8834-4214-b24f-184dbc817ead	2025-08-03 14:36:30.692	2025-08-03 14:37:41.642	256c8598-8834-4214-b24f-184dbc817ead	doctor	8a52a315-04ee-4873-8b5a-cb32af73555b	admin	\N	\N	\N	nguyenvanan@gmail.com	$2b$10$vaueLUclIkcUSNs4zPV3nuSztxuiAWAH3Lfif..7J74CkuI6Vquiy	f	d6dcf19e-9138-4768-a451-05929a74bd35
cff1b9eb-a3ae-427d-a97b-e542257be9cb	2025-08-03 14:39:02.798	2025-08-03 14:40:05.604	cff1b9eb-a3ae-427d-a97b-e542257be9cb	doctor	8a52a315-04ee-4873-8b5a-cb32af73555b	admin	\N	\N	\N	vanbinh@gmail.com	$2b$10$FF714gHJnkCaUh9ZnMpTA.TrD93doMxJoN/VYZbcWQv484U5E4fce	f	cd723839-fe1a-4cd1-987c-64b3155b6d87
f164c821-99be-4ec5-83cb-5dbcd2a1f898	2025-08-03 14:40:40.212	2025-08-03 14:41:59.366	f164c821-99be-4ec5-83cb-5dbcd2a1f898	doctor	8a52a315-04ee-4873-8b5a-cb32af73555b	admin	\N	\N	\N	congvan@hospital.com	$2b$10$vROOH7G00TO0L0pPeZ0V9uo65yeLxGThE/Wa7lJ9dzGBefxjskt.G	f	4d1b7827-f266-4750-a121-99efea1d6141
3bf90824-6cc3-4ce4-b30e-0a088c7817a8	2025-08-03 14:42:18.856	2025-08-03 14:43:05.46	3bf90824-6cc3-4ce4-b30e-0a088c7817a8	doctor	8a52a315-04ee-4873-8b5a-cb32af73555b	admin	\N	\N	\N	nguyenvand@hospital.vn	$2b$10$3yeh12wgmUpLMTfx9x4u6.wbyGtRUN5VmzpnH0E3Xt/Gpf5.ynI..	f	5e69b960-504d-4431-b9ef-77477acf38ef
eea256ac-2817-4b7d-84a1-c50c83ac95b1	2025-08-03 14:43:29.253	2025-08-03 14:43:59.35	eea256ac-2817-4b7d-84a1-c50c83ac95b1	doctor	8a52a315-04ee-4873-8b5a-cb32af73555b	admin	\N	\N	\N	yen0908@hospital.vn	$2b$10$MXxeLQxlfAz2hIGSf58rKOnVO4x7KIdjohRnWXQMaevwvv.Nck26O	f	643d496c-b9da-435a-b338-57bf890b25ba
5b7c50b4-5f75-4fe9-9abf-d1ce98136141	2025-08-03 14:44:21.59	2025-08-03 14:44:57.744	5b7c50b4-5f75-4fe9-9abf-d1ce98136141	doctor	8a52a315-04ee-4873-8b5a-cb32af73555b	admin	\N	\N	\N	ductran@hospital.vn	$2b$10$JQaGUOpkielCH0XlX3N2MO4zc4nuRewAES/3azMJWrHPk52FVJdeu	f	6a4e64af-9fd1-4a53-985b-74ec344d5eb0
76eff7b6-bb57-49aa-8ccc-5a2f63af12a0	2025-08-03 14:45:18.617	2025-08-03 14:46:27.955	76eff7b6-bb57-49aa-8ccc-5a2f63af12a0	doctor	8a52a315-04ee-4873-8b5a-cb32af73555b	admin	\N	\N	\N	giangtran@hospital.vn	$2b$10$ylHMl/Hu0LWLGxFTYtCAdOsxVRnPE/TIwDBnFJZXg2rF7sSTWNoka	f	3d0e7cd6-07ae-4297-9013-5ff4769e0da6
d2198f5a-b3aa-4687-880b-a04bf1d57e18	2025-08-03 14:46:56.296	2025-08-03 14:47:22.125	d2198f5a-b3aa-4687-880b-a04bf1d57e18	doctor	8a52a315-04ee-4873-8b5a-cb32af73555b	admin	\N	\N	\N	huyenvu@hospital.vn	$2b$10$Y3zGJ4p/wH4IRiGQXD0x3ORfKbCiN1tMvPl9nic7A2TTJnTHhyDRq	f	4c089b51-2531-4cfa-85d0-be3822bae829
8c1225c5-38fc-41ca-a7bf-7c3bf3ce483a	2025-08-03 14:48:02.941	2025-08-03 14:48:40.47	8c1225c5-38fc-41ca-a7bf-7c3bf3ce483a	doctor	8a52a315-04ee-4873-8b5a-cb32af73555b	admin	\N	\N	\N	khai123@hospital.vn	$2b$10$T5SrqxSWDnpXmmxOFo.s7OrKU8Hvy9MRKQ1Vx2SGVlyHwIZqgt.Ly	f	91b3ab21-233a-498b-aba8-2f00f5ca1c46
89480d8a-2da5-4404-aee9-24b24d767718	2025-08-03 14:49:03.438	2025-08-03 14:49:23.433	89480d8a-2da5-4404-aee9-24b24d767718	doctor	8a52a315-04ee-4873-8b5a-cb32af73555b	admin	\N	\N	\N	lelien@hospital.vn	$2b$10$bDECp/S/gAJex0c1F0ysY.s/j.kEH8CNO/PLeqzY0FPtoS.J3pJDu	f	3390040d-446a-428a-8828-cec4c722aec1
3acfda41-60ab-47f7-913f-c7cfba771661	2025-08-14 08:34:47.974	2025-08-14 08:34:47.974	3acfda41-60ab-47f7-913f-c7cfba771661	doctor	3acfda41-60ab-47f7-913f-c7cfba771661	doctor	\N	\N	\N	jackfrost8520@gmail.com	$2b$10$Kq.X5beQx3hZVwPiYbkPGO41W4oGCkqbLVQn6i45c24HxWyENXaBy	f	\N
\.


--
-- Data for Name: doctor_clinic_maps; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.doctor_clinic_maps (id, "createdAt", "updatedAt", "createdById", "createdByType", "updatedById", "updatedByType", "deletedAt", "deletedById", "deletedByType", exam_fee, status, doctor_id, clinic_id) FROM stdin;
18ed0052-d594-4685-95ae-6a61ad0d8f21	2025-08-03 15:01:37.934	2025-08-03 15:01:37.934	8a52a315-04ee-4873-8b5a-cb32af73555b	admin	8a52a315-04ee-4873-8b5a-cb32af73555b	admin	\N	\N	\N	350000	active	d2198f5a-b3aa-4687-880b-a04bf1d57e18	2007befe-eabb-4c2b-9844-2280680130f5
1a843207-9dbf-4595-8f55-00629fb219c3	2025-08-03 15:00:54.615294	2025-08-03 15:00:54.615294	\N	\N	\N	\N	\N	\N	\N	350000	active	f164c821-99be-4ec5-83cb-5dbcd2a1f898	2007befe-eabb-4c2b-9844-2280680130f5
2e08a4af-d0c1-4473-95f6-805e5342cc2a	2025-08-03 14:54:00.187615	2025-08-03 14:54:00.187615	\N	\N	\N	\N	\N	\N	\N	350000	active	3bf90824-6cc3-4ce4-b30e-0a088c7817a8	ac0634ad-93e6-43e4-903b-e4f4e4b589a2
2e8ceed0-911c-478a-95c0-68e1dc947586	2025-08-03 15:12:26.846	2025-08-03 15:12:26.846	8a52a315-04ee-4873-8b5a-cb32af73555b	admin	8a52a315-04ee-4873-8b5a-cb32af73555b	admin	\N	\N	\N	350000	active	cff1b9eb-a3ae-427d-a97b-e542257be9cb	280f44f6-162e-401f-90b6-f51644c6f951
3189babb-44b5-4586-be11-53beb2bddf7a	2025-08-03 15:07:50.325	2025-08-03 15:07:50.325	8a52a315-04ee-4873-8b5a-cb32af73555b	admin	8a52a315-04ee-4873-8b5a-cb32af73555b	admin	\N	\N	\N	350000	active	f164c821-99be-4ec5-83cb-5dbcd2a1f898	48804348-8656-4528-a069-8c3d3c8a1ea6
495b221b-2478-4060-8ce7-085f4822ba51	2025-08-03 15:02:13.928	2025-08-03 15:02:13.928	8a52a315-04ee-4873-8b5a-cb32af73555b	admin	8a52a315-04ee-4873-8b5a-cb32af73555b	admin	\N	\N	\N	350000	active	76eff7b6-bb57-49aa-8ccc-5a2f63af12a0	2007befe-eabb-4c2b-9844-2280680130f5
58450b42-46a5-4647-af6e-ad57d86e11c0	2025-08-03 15:04:47.556	2025-08-03 15:04:47.556	8a52a315-04ee-4873-8b5a-cb32af73555b	admin	8a52a315-04ee-4873-8b5a-cb32af73555b	admin	\N	\N	\N	350000	active	eea256ac-2817-4b7d-84a1-c50c83ac95b1	ac0634ad-93e6-43e4-903b-e4f4e4b589a2
5ad52e57-4de0-4eab-87c1-7ce8ecb1c6cb	2025-08-03 14:54:56.403	2025-08-03 14:54:56.403	8a52a315-04ee-4873-8b5a-cb32af73555b	admin	8a52a315-04ee-4873-8b5a-cb32af73555b	admin	\N	\N	\N	350000	active	89480d8a-2da5-4404-aee9-24b24d767718	280f44f6-162e-401f-90b6-f51644c6f951
6c1487b0-8b0d-4de0-96a5-b3ff930c0df8	2025-08-03 15:02:46.161	2025-08-03 15:02:46.161	8a52a315-04ee-4873-8b5a-cb32af73555b	admin	8a52a315-04ee-4873-8b5a-cb32af73555b	admin	\N	\N	\N	350000	active	5b7c50b4-5f75-4fe9-9abf-d1ce98136141	ac0634ad-93e6-43e4-903b-e4f4e4b589a2
6ff4937a-24e3-4cd3-a474-0f3396862fdd	2025-08-03 14:50:54.92663	2025-08-03 14:50:54.92663	\N	\N	\N	\N	\N	\N	\N	350000	active	256c8598-8834-4214-b24f-184dbc817ead	280f44f6-162e-401f-90b6-f51644c6f951
8b6e7976-2714-4aaa-a384-e340e46d157a	2025-08-03 15:01:42.204	2025-08-03 15:01:42.204	8a52a315-04ee-4873-8b5a-cb32af73555b	admin	8a52a315-04ee-4873-8b5a-cb32af73555b	admin	\N	\N	\N	350000	active	d2198f5a-b3aa-4687-880b-a04bf1d57e18	ac0634ad-93e6-43e4-903b-e4f4e4b589a2
8c494f31-3223-45b3-9c25-0f081d713365	2025-08-03 15:01:09.975	2025-08-03 15:01:09.975	8a52a315-04ee-4873-8b5a-cb32af73555b	admin	8a52a315-04ee-4873-8b5a-cb32af73555b	admin	\N	\N	\N	350000	active	8c1225c5-38fc-41ca-a7bf-7c3bf3ce483a	2007befe-eabb-4c2b-9844-2280680130f5
9d1383ad-0528-403a-8469-9164c8caa4c3	2025-08-03 14:55:03.281	2025-08-03 14:55:03.281	8a52a315-04ee-4873-8b5a-cb32af73555b	admin	8a52a315-04ee-4873-8b5a-cb32af73555b	admin	\N	\N	\N	350000	active	89480d8a-2da5-4404-aee9-24b24d767718	ac0634ad-93e6-43e4-903b-e4f4e4b589a2
c11c439b-42cc-4fec-a8aa-bf7df49ef6e8	2025-08-03 15:04:52.036	2025-08-03 15:04:52.036	8a52a315-04ee-4873-8b5a-cb32af73555b	admin	8a52a315-04ee-4873-8b5a-cb32af73555b	admin	\N	\N	\N	350000	active	eea256ac-2817-4b7d-84a1-c50c83ac95b1	48804348-8656-4528-a069-8c3d3c8a1ea6
dae29c32-72e0-4ead-8bba-e1f386606e1a	2025-08-03 14:55:43.918	2025-08-03 14:55:43.918	8a52a315-04ee-4873-8b5a-cb32af73555b	admin	8a52a315-04ee-4873-8b5a-cb32af73555b	admin	\N	\N	\N	350000	active	8c1225c5-38fc-41ca-a7bf-7c3bf3ce483a	ac0634ad-93e6-43e4-903b-e4f4e4b589a2
db0a61b2-3a56-4bde-837f-ca26645b9583	2025-08-03 15:12:53.867	2025-08-03 15:12:53.867	8a52a315-04ee-4873-8b5a-cb32af73555b	admin	8a52a315-04ee-4873-8b5a-cb32af73555b	admin	\N	\N	\N	350000	active	256c8598-8834-4214-b24f-184dbc817ead	2007befe-eabb-4c2b-9844-2280680130f5
e80253d7-2bb0-45e7-9438-b4c590c9a80b	2025-08-03 15:02:40.804	2025-08-03 15:02:40.804	8a52a315-04ee-4873-8b5a-cb32af73555b	admin	8a52a315-04ee-4873-8b5a-cb32af73555b	admin	\N	\N	\N	350000	active	5b7c50b4-5f75-4fe9-9abf-d1ce98136141	48804348-8656-4528-a069-8c3d3c8a1ea6
f74d3b01-f8ef-4005-943e-1bfbd5d9c974	2025-08-03 15:06:10.264	2025-08-03 15:06:10.264	8a52a315-04ee-4873-8b5a-cb32af73555b	admin	8a52a315-04ee-4873-8b5a-cb32af73555b	admin	\N	\N	\N	350000	active	3bf90824-6cc3-4ce4-b30e-0a088c7817a8	48804348-8656-4528-a069-8c3d3c8a1ea6
f86dea00-7ce1-4e1a-9ea2-84cfe1a83180	2025-08-03 15:02:07.652	2025-08-03 15:02:07.652	8a52a315-04ee-4873-8b5a-cb32af73555b	admin	8a52a315-04ee-4873-8b5a-cb32af73555b	admin	\N	\N	\N	350000	active	76eff7b6-bb57-49aa-8ccc-5a2f63af12a0	280f44f6-162e-401f-90b6-f51644c6f951
f9f391c0-f35d-4286-ad8a-8543b4fd4c37	2025-08-03 14:52:03.197234	2025-08-03 14:52:03.197234	\N	\N	\N	\N	\N	\N	\N	350000	active	cff1b9eb-a3ae-427d-a97b-e542257be9cb	48804348-8656-4528-a069-8c3d3c8a1ea6
cc1fcee8-1eca-472c-b112-87ec9c2c07fd	2025-08-14 08:34:48.004372	2025-08-14 08:34:48.004372	\N	\N	\N	\N	\N	\N	\N	\N	active	3acfda41-60ab-47f7-913f-c7cfba771661	280f44f6-162e-401f-90b6-f51644c6f951
\.


--
-- Data for Name: doctor_service_link; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.doctor_service_link (id, "createdAt", "updatedAt", "createdById", "createdByType", "updatedById", "updatedByType", "deletedAt", "deletedById", "deletedByType", price, doctor_id, service_id) FROM stdin;
\.


--
-- Data for Name: doctor_workshift; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.doctor_workshift (id, "createdAt", "updatedAt", "createdById", "createdByType", "updatedById", "updatedByType", "deletedAt", "deletedById", "deletedByType", start_time, duration, status, space, doctor_clinic_link_id) FROM stdin;
4e74f2c3-369a-48d1-bd7a-122b1e3d5d72	2025-08-03 15:29:39.197718	2025-08-03 15:29:39.197718	256c8598-8834-4214-b24f-184dbc817ead	doctor	\N	\N	\N	\N	\N	2025-08-25 00:00:00	01:30:00	available	3	6ff4937a-24e3-4cd3-a474-0f3396862fdd
fcbe2d85-aa6b-42f9-a353-b11d9830ee64	2025-08-03 15:30:26.409433	2025-08-03 15:30:26.409433	256c8598-8834-4214-b24f-184dbc817ead	doctor	\N	\N	\N	\N	\N	2025-08-26 00:00:00	01:30:00	available	3	6ff4937a-24e3-4cd3-a474-0f3396862fdd
f5b5c18b-431f-414e-992d-7519ab87d101	2025-08-03 15:32:13.150762	2025-08-03 15:32:13.150762	256c8598-8834-4214-b24f-184dbc817ead	doctor	\N	\N	\N	\N	\N	2025-08-28 00:00:00	01:30:00	available	3	6ff4937a-24e3-4cd3-a474-0f3396862fdd
c58f3678-78e5-459f-bdbd-202b86d0163b	2025-08-03 15:32:19.541175	2025-08-03 15:32:19.541175	256c8598-8834-4214-b24f-184dbc817ead	doctor	\N	\N	\N	\N	\N	2025-08-29 00:00:00	01:30:00	available	3	6ff4937a-24e3-4cd3-a474-0f3396862fdd
89ef7ba5-e3b9-447a-80c5-7371b38fa790	2025-08-03 15:32:24.826359	2025-08-03 15:32:24.826359	256c8598-8834-4214-b24f-184dbc817ead	doctor	\N	\N	\N	\N	\N	2025-08-30 00:00:00	01:30:00	available	3	6ff4937a-24e3-4cd3-a474-0f3396862fdd
1bb70bdc-16c8-4fce-b8e2-1e407f5f27d4	2025-08-03 15:32:29.333883	2025-08-03 15:32:29.333883	256c8598-8834-4214-b24f-184dbc817ead	doctor	\N	\N	\N	\N	\N	2025-08-31 00:00:00	01:30:00	available	3	6ff4937a-24e3-4cd3-a474-0f3396862fdd
c90ddedb-6d7a-4f85-a718-924e97b5aebd	2025-08-03 15:32:43.72465	2025-08-03 15:32:43.72465	256c8598-8834-4214-b24f-184dbc817ead	doctor	\N	\N	\N	\N	\N	2025-08-27 00:00:00	01:30:00	available	3	6ff4937a-24e3-4cd3-a474-0f3396862fdd
c79e806f-c95b-41b7-abcf-f85543403a49	2025-08-03 15:33:06.822078	2025-08-03 15:33:06.822078	256c8598-8834-4214-b24f-184dbc817ead	doctor	\N	\N	\N	\N	\N	2025-08-25 01:30:00	01:30:00	available	3	6ff4937a-24e3-4cd3-a474-0f3396862fdd
3333350f-f498-444e-bc5d-9e54c308195a	2025-08-03 15:33:19.421899	2025-08-03 15:33:19.421899	256c8598-8834-4214-b24f-184dbc817ead	doctor	\N	\N	\N	\N	\N	2025-08-26 01:30:00	01:30:00	available	3	6ff4937a-24e3-4cd3-a474-0f3396862fdd
82fb732f-5601-4d57-98d8-97be4d728347	2025-08-03 15:33:23.138149	2025-08-03 15:33:23.138149	256c8598-8834-4214-b24f-184dbc817ead	doctor	\N	\N	\N	\N	\N	2025-08-27 01:30:00	01:30:00	available	3	6ff4937a-24e3-4cd3-a474-0f3396862fdd
9d5dcae4-49b1-4181-94f0-033a88d7bb14	2025-08-03 15:33:26.019206	2025-08-03 15:33:26.019206	256c8598-8834-4214-b24f-184dbc817ead	doctor	\N	\N	\N	\N	\N	2025-08-28 01:30:00	01:30:00	available	3	6ff4937a-24e3-4cd3-a474-0f3396862fdd
283c804b-1971-4114-ac58-15aab9a82506	2025-08-03 15:33:34.751155	2025-08-03 15:33:34.751155	256c8598-8834-4214-b24f-184dbc817ead	doctor	\N	\N	\N	\N	\N	2025-08-29 01:30:00	01:30:00	available	3	6ff4937a-24e3-4cd3-a474-0f3396862fdd
2b764aef-7cf3-42fd-9d62-71b9d5448595	2025-08-03 15:33:38.48999	2025-08-03 15:33:38.48999	256c8598-8834-4214-b24f-184dbc817ead	doctor	\N	\N	\N	\N	\N	2025-08-30 01:30:00	01:30:00	available	3	6ff4937a-24e3-4cd3-a474-0f3396862fdd
1d02864a-c55a-4742-b7bf-80bc2255366b	2025-08-03 15:33:51.991004	2025-08-03 15:33:51.991004	256c8598-8834-4214-b24f-184dbc817ead	doctor	\N	\N	\N	\N	\N	2025-08-31 01:30:00	01:30:00	available	3	6ff4937a-24e3-4cd3-a474-0f3396862fdd
48511169-9f7f-441b-932c-fc97bf55c239	2025-08-03 15:49:11.704023	2025-08-03 15:49:11.704023	256c8598-8834-4214-b24f-184dbc817ead	doctor	\N	\N	\N	\N	\N	2025-08-25 06:00:00	01:30:00	available	2	db0a61b2-3a56-4bde-837f-ca26645b9583
bfcaf409-fd8f-4e81-b659-03029c660eff	2025-08-03 15:49:16.94502	2025-08-03 15:49:16.94502	256c8598-8834-4214-b24f-184dbc817ead	doctor	\N	\N	\N	\N	\N	2025-08-26 06:00:00	01:30:00	available	2	db0a61b2-3a56-4bde-837f-ca26645b9583
6110a2ea-a18e-40f7-8716-8e4647d1a6e7	2025-08-03 15:49:20.176147	2025-08-03 15:49:20.176147	256c8598-8834-4214-b24f-184dbc817ead	doctor	\N	\N	\N	\N	\N	2025-08-27 06:00:00	01:30:00	available	2	db0a61b2-3a56-4bde-837f-ca26645b9583
acdd6b4a-917a-4390-a8ec-5b7b8fe6a1d8	2025-08-03 15:49:24.114692	2025-08-03 15:49:24.114692	256c8598-8834-4214-b24f-184dbc817ead	doctor	\N	\N	\N	\N	\N	2025-08-28 06:00:00	01:30:00	available	2	db0a61b2-3a56-4bde-837f-ca26645b9583
53820031-3da0-4bb1-899d-5fe170410a4a	2025-08-03 15:49:31.474644	2025-08-03 15:49:31.474644	256c8598-8834-4214-b24f-184dbc817ead	doctor	\N	\N	\N	\N	\N	2025-08-29 06:00:00	01:30:00	available	2	db0a61b2-3a56-4bde-837f-ca26645b9583
8da59c3d-1d3c-44b7-a52c-5d7547ffa8d5	2025-08-03 15:49:35.797881	2025-08-03 15:49:35.797881	256c8598-8834-4214-b24f-184dbc817ead	doctor	\N	\N	\N	\N	\N	2025-08-30 06:00:00	01:30:00	available	2	db0a61b2-3a56-4bde-837f-ca26645b9583
206ad376-6f10-46da-8529-1dd5366d52bb	2025-08-03 15:49:40.542996	2025-08-03 15:49:40.542996	256c8598-8834-4214-b24f-184dbc817ead	doctor	\N	\N	\N	\N	\N	2025-08-31 06:00:00	01:30:00	available	2	db0a61b2-3a56-4bde-837f-ca26645b9583
bed65f0e-bd50-4d17-8ac3-11a1c42fac22	2025-08-03 15:50:03.657152	2025-08-03 15:50:03.657152	256c8598-8834-4214-b24f-184dbc817ead	doctor	\N	\N	\N	\N	\N	2025-08-25 07:30:00	01:30:00	available	2	db0a61b2-3a56-4bde-837f-ca26645b9583
3d013547-ff49-4b6e-b3b5-55b8b26f35e1	2025-08-03 15:50:09.11473	2025-08-03 15:50:09.11473	256c8598-8834-4214-b24f-184dbc817ead	doctor	\N	\N	\N	\N	\N	2025-08-26 07:30:00	01:30:00	available	2	db0a61b2-3a56-4bde-837f-ca26645b9583
5f96fbf2-4f47-42cf-883e-51dbab3bf1f1	2025-08-03 15:50:12.167935	2025-08-03 15:50:12.167935	256c8598-8834-4214-b24f-184dbc817ead	doctor	\N	\N	\N	\N	\N	2025-08-27 07:30:00	01:30:00	available	2	db0a61b2-3a56-4bde-837f-ca26645b9583
3577bc4f-b7c8-451a-8301-173eeed47c4f	2025-08-03 15:50:14.977291	2025-08-03 15:50:14.977291	256c8598-8834-4214-b24f-184dbc817ead	doctor	\N	\N	\N	\N	\N	2025-08-28 07:30:00	01:30:00	available	2	db0a61b2-3a56-4bde-837f-ca26645b9583
5301a639-f5da-404a-8d38-d89bc3469d1a	2025-08-03 15:50:17.924559	2025-08-03 15:50:17.924559	256c8598-8834-4214-b24f-184dbc817ead	doctor	\N	\N	\N	\N	\N	2025-08-29 07:30:00	01:30:00	available	2	db0a61b2-3a56-4bde-837f-ca26645b9583
a41de20a-7169-4b8a-a868-cefee76b039b	2025-08-03 15:50:21.778405	2025-08-03 15:50:21.778405	256c8598-8834-4214-b24f-184dbc817ead	doctor	\N	\N	\N	\N	\N	2025-08-30 07:30:00	01:30:00	available	2	db0a61b2-3a56-4bde-837f-ca26645b9583
fe25937d-60a6-4ea3-b0ed-6aecf4b440fc	2025-08-03 15:50:24.880697	2025-08-03 15:50:24.880697	256c8598-8834-4214-b24f-184dbc817ead	doctor	\N	\N	\N	\N	\N	2025-08-31 07:30:00	01:30:00	available	2	db0a61b2-3a56-4bde-837f-ca26645b9583
337ac926-319f-412d-849d-847a17d25028	2025-08-03 15:52:05.821676	2025-08-03 15:52:05.821676	8c1225c5-38fc-41ca-a7bf-7c3bf3ce483a	doctor	\N	\N	\N	\N	\N	2025-08-25 00:00:00	01:30:00	available	2	dae29c32-72e0-4ead-8bba-e1f386606e1a
61214a3c-fef7-4edf-b2da-994be747264f	2025-08-03 15:52:08.630769	2025-08-03 15:52:08.630769	8c1225c5-38fc-41ca-a7bf-7c3bf3ce483a	doctor	\N	\N	\N	\N	\N	2025-08-26 00:00:00	01:30:00	available	2	dae29c32-72e0-4ead-8bba-e1f386606e1a
df2d3608-e7ff-405a-b648-9cfd43d022cc	2025-08-03 15:52:12.342797	2025-08-03 15:52:12.342797	8c1225c5-38fc-41ca-a7bf-7c3bf3ce483a	doctor	\N	\N	\N	\N	\N	2025-08-27 00:00:00	01:30:00	available	2	dae29c32-72e0-4ead-8bba-e1f386606e1a
f42062cc-0574-45da-9921-38012de875fd	2025-08-03 15:52:14.905574	2025-08-03 15:52:14.905574	8c1225c5-38fc-41ca-a7bf-7c3bf3ce483a	doctor	\N	\N	\N	\N	\N	2025-08-28 00:00:00	01:30:00	available	2	dae29c32-72e0-4ead-8bba-e1f386606e1a
bb3a049f-28f5-43a1-b702-045f8adada8f	2025-08-03 15:52:20.05557	2025-08-03 15:52:20.05557	8c1225c5-38fc-41ca-a7bf-7c3bf3ce483a	doctor	\N	\N	\N	\N	\N	2025-08-29 00:00:00	01:30:00	available	2	dae29c32-72e0-4ead-8bba-e1f386606e1a
bb02279c-606e-4967-a9dc-aa5976ef1fdd	2025-08-03 15:52:23.521752	2025-08-03 15:52:23.521752	8c1225c5-38fc-41ca-a7bf-7c3bf3ce483a	doctor	\N	\N	\N	\N	\N	2025-08-30 00:00:00	01:30:00	available	2	dae29c32-72e0-4ead-8bba-e1f386606e1a
c8d8b0b1-9a21-4026-a07d-a49aba20c76a	2025-08-03 15:52:28.247587	2025-08-03 15:52:28.247587	8c1225c5-38fc-41ca-a7bf-7c3bf3ce483a	doctor	\N	\N	\N	\N	\N	2025-08-31 00:00:00	01:30:00	available	2	dae29c32-72e0-4ead-8bba-e1f386606e1a
044a41c4-b137-4de5-9c5b-cb1bb008ce8b	2025-08-03 15:52:43.181317	2025-08-03 15:52:43.181317	8c1225c5-38fc-41ca-a7bf-7c3bf3ce483a	doctor	\N	\N	\N	\N	\N	2025-08-25 01:30:00	01:30:00	available	2	dae29c32-72e0-4ead-8bba-e1f386606e1a
1dfa16f1-5535-491c-8bfd-a1de0cebe94f	2025-08-03 15:52:46.596213	2025-08-03 15:52:46.596213	8c1225c5-38fc-41ca-a7bf-7c3bf3ce483a	doctor	\N	\N	\N	\N	\N	2025-08-26 01:30:00	01:30:00	available	2	dae29c32-72e0-4ead-8bba-e1f386606e1a
50a813e6-09d5-4083-bd9d-9a0fd1a0ea46	2025-08-03 15:52:51.037929	2025-08-03 15:52:51.037929	8c1225c5-38fc-41ca-a7bf-7c3bf3ce483a	doctor	\N	\N	\N	\N	\N	2025-08-27 01:30:00	01:30:00	available	2	dae29c32-72e0-4ead-8bba-e1f386606e1a
8dfd164f-b90e-487b-8123-43beb552735a	2025-08-03 15:52:53.517755	2025-08-03 15:52:53.517755	8c1225c5-38fc-41ca-a7bf-7c3bf3ce483a	doctor	\N	\N	\N	\N	\N	2025-08-28 01:30:00	01:30:00	available	2	dae29c32-72e0-4ead-8bba-e1f386606e1a
13c57445-fd3f-4b4e-895d-3dd108f63a36	2025-08-03 15:52:57.793922	2025-08-03 15:52:57.793922	8c1225c5-38fc-41ca-a7bf-7c3bf3ce483a	doctor	\N	\N	\N	\N	\N	2025-08-29 01:30:00	01:30:00	available	2	dae29c32-72e0-4ead-8bba-e1f386606e1a
e3b747eb-2bb5-42d2-b8ee-ca01e7b62882	2025-08-03 15:53:02.4297	2025-08-03 15:53:02.4297	8c1225c5-38fc-41ca-a7bf-7c3bf3ce483a	doctor	\N	\N	\N	\N	\N	2025-08-30 01:30:00	01:30:00	available	2	dae29c32-72e0-4ead-8bba-e1f386606e1a
b35c2d46-6b15-4744-9cfa-adc2b99f16ef	2025-08-03 15:53:04.912856	2025-08-03 15:53:04.912856	8c1225c5-38fc-41ca-a7bf-7c3bf3ce483a	doctor	\N	\N	\N	\N	\N	2025-08-31 01:30:00	01:30:00	available	2	dae29c32-72e0-4ead-8bba-e1f386606e1a
ade7afb6-d4e3-4298-9a33-0d25cf720b6a	2025-08-03 15:54:16.634145	2025-08-03 15:54:16.634145	8c1225c5-38fc-41ca-a7bf-7c3bf3ce483a	doctor	\N	\N	\N	\N	\N	2025-08-25 06:00:00	01:30:00	available	2	8c494f31-3223-45b3-9c25-0f081d713365
a6600b86-895b-4f0d-9416-56655965f910	2025-08-03 15:54:19.934925	2025-08-03 15:54:19.934925	8c1225c5-38fc-41ca-a7bf-7c3bf3ce483a	doctor	\N	\N	\N	\N	\N	2025-08-26 06:00:00	01:30:00	available	2	8c494f31-3223-45b3-9c25-0f081d713365
189053e2-5bd3-4799-9dd5-c687e6db9893	2025-08-03 15:54:23.175422	2025-08-03 15:54:23.175422	8c1225c5-38fc-41ca-a7bf-7c3bf3ce483a	doctor	\N	\N	\N	\N	\N	2025-08-27 06:00:00	01:30:00	available	2	8c494f31-3223-45b3-9c25-0f081d713365
8c32f4d2-8eac-4471-a1b9-18c46680c076	2025-08-03 15:54:29.680795	2025-08-03 15:54:29.680795	8c1225c5-38fc-41ca-a7bf-7c3bf3ce483a	doctor	\N	\N	\N	\N	\N	2025-08-28 06:00:00	01:30:00	available	2	8c494f31-3223-45b3-9c25-0f081d713365
d10fbc8b-0667-4f12-b7ce-c14cbaf01090	2025-08-03 15:54:32.690632	2025-08-03 15:54:32.690632	8c1225c5-38fc-41ca-a7bf-7c3bf3ce483a	doctor	\N	\N	\N	\N	\N	2025-08-29 06:00:00	01:30:00	available	2	8c494f31-3223-45b3-9c25-0f081d713365
6fb0be0f-5220-414c-be13-210d7bbc3a10	2025-08-03 15:54:36.826437	2025-08-03 15:54:36.826437	8c1225c5-38fc-41ca-a7bf-7c3bf3ce483a	doctor	\N	\N	\N	\N	\N	2025-08-30 06:00:00	01:30:00	available	2	8c494f31-3223-45b3-9c25-0f081d713365
56364ff1-f5a0-4649-afae-ac6845d4295a	2025-08-03 15:54:39.202484	2025-08-03 15:54:39.202484	8c1225c5-38fc-41ca-a7bf-7c3bf3ce483a	doctor	\N	\N	\N	\N	\N	2025-08-31 06:00:00	01:30:00	available	2	8c494f31-3223-45b3-9c25-0f081d713365
29249768-1952-4dc2-b4c4-f0bd51f6c98e	2025-08-03 15:54:58.387835	2025-08-03 15:54:58.387835	8c1225c5-38fc-41ca-a7bf-7c3bf3ce483a	doctor	\N	\N	\N	\N	\N	2025-08-25 07:30:00	01:30:00	available	2	8c494f31-3223-45b3-9c25-0f081d713365
59e45617-b912-4019-8cd9-762a9326cdb9	2025-08-03 15:55:01.871736	2025-08-03 15:55:01.871736	8c1225c5-38fc-41ca-a7bf-7c3bf3ce483a	doctor	\N	\N	\N	\N	\N	2025-08-26 07:30:00	01:30:00	available	2	8c494f31-3223-45b3-9c25-0f081d713365
35fc0691-d3bc-41f2-a818-bb005e77d097	2025-08-03 15:55:06.779695	2025-08-03 15:55:06.779695	8c1225c5-38fc-41ca-a7bf-7c3bf3ce483a	doctor	\N	\N	\N	\N	\N	2025-08-27 07:30:00	01:30:00	available	2	8c494f31-3223-45b3-9c25-0f081d713365
a9a09beb-7915-4900-9151-3b31aea3b480	2025-08-03 15:55:15.264032	2025-08-03 15:55:15.264032	8c1225c5-38fc-41ca-a7bf-7c3bf3ce483a	doctor	\N	\N	\N	\N	\N	2025-08-28 07:30:00	01:30:00	available	2	8c494f31-3223-45b3-9c25-0f081d713365
91f74f96-ac51-4a3f-8a0f-d5d8c4a57a38	2025-08-03 15:55:18.494448	2025-08-03 15:55:18.494448	8c1225c5-38fc-41ca-a7bf-7c3bf3ce483a	doctor	\N	\N	\N	\N	\N	2025-08-29 07:30:00	01:30:00	available	2	8c494f31-3223-45b3-9c25-0f081d713365
3308a270-c475-4d24-bc82-25af254b1d87	2025-08-03 15:55:22.862523	2025-08-03 15:55:22.862523	8c1225c5-38fc-41ca-a7bf-7c3bf3ce483a	doctor	\N	\N	\N	\N	\N	2025-08-30 07:30:00	01:30:00	available	2	8c494f31-3223-45b3-9c25-0f081d713365
9ebd20d6-8b9d-4b14-81e4-4dd2c4b5cb9f	2025-08-03 15:55:26.704834	2025-08-03 15:55:26.704834	8c1225c5-38fc-41ca-a7bf-7c3bf3ce483a	doctor	\N	\N	\N	\N	\N	2025-08-31 07:30:00	01:30:00	available	2	8c494f31-3223-45b3-9c25-0f081d713365
\.


--
-- Data for Name: employee; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.employee (id, "createdAt", "updatedAt", "createdById", "createdByType", "updatedById", "updatedByType", "deletedAt", "deletedById", "deletedByType", email, password, clinic_id, is_locked, staff_info_id) FROM stdin;
31856b47-4b85-4863-bdcc-54cd4f4d8442	2025-08-03 16:01:30.832	2025-08-03 16:01:30.832	31856b47-4b85-4863-bdcc-54cd4f4d8442	employee	31856b47-4b85-4863-bdcc-54cd4f4d8442	employee	\N	\N	\N	maitran@gmail.com	$2b$10$M7Zc5EqpcWnjzxDWPcmWGOOTxWiWN6KI86mhZgcefG7SXJ9HYM4v2	280f44f6-162e-401f-90b6-f51644c6f951	f	\N
cc2bd164-4ce0-4d72-82fa-2c07774519b4	2025-08-03 16:03:24.949	2025-08-03 16:03:24.949	cc2bd164-4ce0-4d72-82fa-2c07774519b4	employee	cc2bd164-4ce0-4d72-82fa-2c07774519b4	employee	\N	\N	\N	namlehoang@gmail.com	$2b$10$myETGwWBdY1EnYoVsNRTP.rQFHEUNmzWgehTMGjw1EVUrebtOFsEa	48804348-8656-4528-a069-8c3d3c8a1ea6	f	\N
c079181f-d587-41b2-b248-216bc9b6fdff	2025-08-03 16:04:30.347	2025-08-03 16:04:30.347	c079181f-d587-41b2-b248-216bc9b6fdff	employee	c079181f-d587-41b2-b248-216bc9b6fdff	employee	\N	\N	\N	huyphamquang@gmail.com	$2b$10$wDdd3mA5cXyKOImvW2jfZO7Sf6aDwfnxRy7AdVMwP6Ll1ZZlQJJLS	ac0634ad-93e6-43e4-903b-e4f4e4b589a2	f	\N
55c989df-f3ff-4bbf-b0d1-6846dfd768ba	2025-08-03 16:05:28.017	2025-08-03 16:05:28.017	55c989df-f3ff-4bbf-b0d1-6846dfd768ba	employee	55c989df-f3ff-4bbf-b0d1-6846dfd768ba	employee	\N	\N	\N	hanhdothi@gmail.com	$2b$10$qmo2R0aLbzEl7H9B2CwuxOhOVxNhArLeU8t4UnH02a79sV2O4o4CO	2007befe-eabb-4c2b-9844-2280680130f5	f	\N
498fe85e-8f2d-410c-b6a5-a9fbef6b12aa	2025-08-14 11:05:08.407	2025-08-14 11:05:08.407	498fe85e-8f2d-410c-b6a5-a9fbef6b12aa	employee	498fe85e-8f2d-410c-b6a5-a9fbef6b12aa	employee	\N	\N	\N	nhanvien@gmail.com	$2b$10$sxf.nizTdgzreunSbaJPreINrLtQBJu567Nk8u2m8x6yGvuP9F0hW	280f44f6-162e-401f-90b6-f51644c6f951	f	\N
311b7ed4-6f35-4bf8-b713-ac16fb368a74	2025-08-14 21:07:45.101	2025-08-14 21:07:45.101	311b7ed4-6f35-4bf8-b713-ac16fb368a74	employee	311b7ed4-6f35-4bf8-b713-ac16fb368a74	employee	\N	\N	\N	lab@gmail.com	$2b$10$wtiP7xrhPiejztcIXvwDZOEGwrZt995e5HbDgd0p8wWMgrOdp8VZ2	280f44f6-162e-401f-90b6-f51644c6f951	f	\N
\.


--
-- Data for Name: employee_role_link; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.employee_role_link (id, "createdAt", "updatedAt", "createdById", "createdByType", "updatedById", "updatedByType", "deletedAt", "deletedById", "deletedByType", employee_id, role_id) FROM stdin;
\.


--
-- Data for Name: invitation; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.invitation (id, "createdAt", "updatedAt", "createdById", "createdByType", "updatedById", "updatedByType", "deletedAt", "deletedById", "deletedByType", token, doctor_id) FROM stdin;
\.


--
-- Data for Name: role; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.role (id, "createdAt", "updatedAt", "createdById", "createdByType", "updatedById", "updatedByType", "deletedAt", "deletedById", "deletedByType", name, description) FROM stdin;
\.


--
-- Data for Name: service; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.service (id, "createdAt", "updatedAt", "createdById", "createdByType", "updatedById", "updatedByType", "deletedAt", "deletedById", "deletedByType", name, description, clinic_id) FROM stdin;
\.


--
-- Data for Name: specialize; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.specialize (id, "createdAt", "updatedAt", "createdById", "createdByType", "updatedById", "updatedByType", "deletedAt", "deletedById", "deletedByType", name, description, image_id, staff_info_id, certificate_url) FROM stdin;
\.


--
-- Data for Name: staff_info; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.staff_info (id, "createdAt", "updatedAt", "createdById", "createdByType", "updatedById", "updatedByType", "deletedAt", "deletedById", "deletedByType", staff_id, staff_type, full_name, dob, phone, gender, "position", profile_img_id, social_id) FROM stdin;
d6dcf19e-9138-4768-a451-05929a74bd35	2025-08-03 14:37:41.632	2025-08-03 14:37:41.632	8a52a315-04ee-4873-8b5a-cb32af73555b	admin	8a52a315-04ee-4873-8b5a-cb32af73555b	admin	\N	\N	\N	256c8598-8834-4214-b24f-184dbc817ead	doctor	Nguyễn Văn An	1982-09-08	0901341962	male	Tim mạch	\N	\N
cd723839-fe1a-4cd1-987c-64b3155b6d87	2025-08-03 14:40:05.571	2025-08-03 14:40:05.571	8a52a315-04ee-4873-8b5a-cb32af73555b	admin	8a52a315-04ee-4873-8b5a-cb32af73555b	admin	\N	\N	\N	cff1b9eb-a3ae-427d-a97b-e542257be9cb	doctor	Nguyễn Văn Bình	1984-10-20	0901950693	male	Tim mạch	\N	\N
4d1b7827-f266-4750-a121-99efea1d6141	2025-08-03 14:41:59.332	2025-08-03 14:41:59.332	8a52a315-04ee-4873-8b5a-cb32af73555b	admin	8a52a315-04ee-4873-8b5a-cb32af73555b	admin	\N	\N	\N	f164c821-99be-4ec5-83cb-5dbcd2a1f898	doctor	Nguyễn Văn Công	1983-08-15	0901283697	male	Chuyên khoa	\N	\N
5e69b960-504d-4431-b9ef-77477acf38ef	2025-08-03 14:43:05.441	2025-08-03 14:43:05.441	8a52a315-04ee-4873-8b5a-cb32af73555b	admin	8a52a315-04ee-4873-8b5a-cb32af73555b	admin	\N	\N	\N	3bf90824-6cc3-4ce4-b30e-0a088c7817a8	doctor	Nguyễn Thị Dương",	1988-04-13	0901673264	female	Da liễu	\N	\N
643d496c-b9da-435a-b338-57bf890b25ba	2025-08-03 14:43:59.327	2025-08-03 14:43:59.327	8a52a315-04ee-4873-8b5a-cb32af73555b	admin	8a52a315-04ee-4873-8b5a-cb32af73555b	admin	\N	\N	\N	eea256ac-2817-4b7d-84a1-c50c83ac95b1	doctor	Nguyễn Thị Yến	1988-12-15	0901670331	female	Tim mạch	\N	\N
6a4e64af-9fd1-4a53-985b-74ec344d5eb0	2025-08-03 14:44:57.723	2025-08-03 14:44:57.723	8a52a315-04ee-4873-8b5a-cb32af73555b	admin	8a52a315-04ee-4873-8b5a-cb32af73555b	admin	\N	\N	\N	5b7c50b4-5f75-4fe9-9abf-d1ce98136141	doctor	Trần Trung Đức	1983-10-18	0901566561	male	Đa khoa	\N	\N
3d0e7cd6-07ae-4297-9013-5ff4769e0da6	2025-08-03 14:46:27.881	2025-08-03 14:46:27.881	8a52a315-04ee-4873-8b5a-cb32af73555b	admin	8a52a315-04ee-4873-8b5a-cb32af73555b	admin	\N	\N	\N	76eff7b6-bb57-49aa-8ccc-5a2f63af12a0	doctor	Trần Văn Giang	1988-05-18	0901193412	male	Chuyên khoa I	\N	\N
4c089b51-2531-4cfa-85d0-be3822bae829	2025-08-03 14:47:22.104	2025-08-03 14:47:22.104	8a52a315-04ee-4873-8b5a-cb32af73555b	admin	8a52a315-04ee-4873-8b5a-cb32af73555b	admin	\N	\N	\N	d2198f5a-b3aa-4687-880b-a04bf1d57e18	doctor	Vũ Thị Huyền	1981-07-12	0901421122	female	Tim mạch	\N	\N
91b3ab21-233a-498b-aba8-2f00f5ca1c46	2025-08-03 14:48:40.447	2025-08-03 14:48:40.447	8a52a315-04ee-4873-8b5a-cb32af73555b	admin	8a52a315-04ee-4873-8b5a-cb32af73555b	admin	\N	\N	\N	8c1225c5-38fc-41ca-a7bf-7c3bf3ce483a	doctor	Trần Văn Khải	1986-03-16	0901935274	male	Tim mạch	\N	\N
3390040d-446a-428a-8828-cec4c722aec1	2025-08-03 14:49:23.426	2025-08-03 14:49:23.426	8a52a315-04ee-4873-8b5a-cb32af73555b	admin	8a52a315-04ee-4873-8b5a-cb32af73555b	admin	\N	\N	\N	89480d8a-2da5-4404-aee9-24b24d767718	doctor	Lê Liên	1981-11-04	0901659622	female	Nội khoa	\N	\N
d1aa1bee-3691-4c61-a1ed-ba45886d204a	2025-08-03 16:02:27.956	2025-08-03 16:02:27.956	8a52a315-04ee-4873-8b5a-cb32af73555b	admin	8a52a315-04ee-4873-8b5a-cb32af73555b	admin	\N	\N	\N	31856b47-4b85-4863-bdcc-54cd4f4d8442	employee	Trần Thị Mai	1999-12-05	0912345678	female	Lễ tân	\N	\N
cb205ce9-5496-45b5-a40b-2415605b4be0	2025-08-03 16:03:46.533	2025-08-03 16:03:46.533	8a52a315-04ee-4873-8b5a-cb32af73555b	admin	8a52a315-04ee-4873-8b5a-cb32af73555b	admin	\N	\N	\N	cc2bd164-4ce0-4d72-82fa-2c07774519b4	employee	Lê Hoàng Nam	1994-08-07	0987654321	male	Lễ tân	\N	\N
a4153d5f-d4ac-4390-a41b-72e10204f8b3	2025-08-03 16:04:54.715	2025-08-03 16:04:54.715	8a52a315-04ee-4873-8b5a-cb32af73555b	admin	8a52a315-04ee-4873-8b5a-cb32af73555b	admin	\N	\N	\N	c079181f-d587-41b2-b248-216bc9b6fdff	employee	Phạm Quang Huy	1996-04-05	0909123456	male	Lễ tân	\N	\N
899e8cfc-e5aa-4326-869f-eb720c3c506d	2025-08-03 16:05:51.822	2025-08-03 16:05:51.822	8a52a315-04ee-4873-8b5a-cb32af73555b	admin	8a52a315-04ee-4873-8b5a-cb32af73555b	admin	\N	\N	\N	55c989df-f3ff-4bbf-b0d1-6846dfd768ba	employee	Đỗ Thị Hạnh	1998-08-21	0934567890	female	Lễ tân	\N	\N
c4f9b0ce-2b1c-4d7d-bdfe-3741116e52d4	2025-08-14 11:05:44.012	2025-08-14 11:05:44.012	44c41a69-603f-49aa-ab5e-fcf2fbd234cd	admin	44c41a69-603f-49aa-ab5e-fcf2fbd234cd	admin	\N	\N	\N	498fe85e-8f2d-410c-b6a5-a9fbef6b12aa	employee	Nhan Vien	1991-09-11	0364119018	male	ko	\N	\N
4f07b622-e5a1-49f7-b0d9-fb00416f22b0	2025-08-14 21:08:28.247	2025-08-14 21:08:28.247	44c41a69-603f-49aa-ab5e-fcf2fbd234cd	admin	44c41a69-603f-49aa-ab5e-fcf2fbd234cd	admin	\N	\N	\N	311b7ed4-6f35-4bf8-b713-ac16fb368a74	employee	Lab abc	1996-08-15	0364119018	female	abc	\N	\N
\.


--
-- Name: doctor_workshift PK_2fc1b392643d0ebcdc19d3b06bc; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctor_workshift
    ADD CONSTRAINT "PK_2fc1b392643d0ebcdc19d3b06bc" PRIMARY KEY (id);


--
-- Name: staff_info PK_3b24c57d8ea36582e83d419a15d; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff_info
    ADD CONSTRAINT "PK_3b24c57d8ea36582e83d419a15d" PRIMARY KEY (id);


--
-- Name: employee PK_3c2bc72f03fd5abbbc5ac169498; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee
    ADD CONSTRAINT "PK_3c2bc72f03fd5abbbc5ac169498" PRIMARY KEY (id);


--
-- Name: employee_role_link PK_6ba855fbd84e4edbfa43e0efb34; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_role_link
    ADD CONSTRAINT "PK_6ba855fbd84e4edbfa43e0efb34" PRIMARY KEY (id);


--
-- Name: service PK_85a21558c006647cd76fdce044b; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.service
    ADD CONSTRAINT "PK_85a21558c006647cd76fdce044b" PRIMARY KEY (id);


--
-- Name: clinic PK_8e97c18debc9c7f7606e311d763; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clinic
    ADD CONSTRAINT "PK_8e97c18debc9c7f7606e311d763" PRIMARY KEY (id);


--
-- Name: doctor_service_link PK_939da1297a0ec28eb286edce755; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctor_service_link
    ADD CONSTRAINT "PK_939da1297a0ec28eb286edce755" PRIMARY KEY (id);


--
-- Name: degree PK_98a6bfd72670bddb790a13cbca1; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.degree
    ADD CONSTRAINT "PK_98a6bfd72670bddb790a13cbca1" PRIMARY KEY (id);


--
-- Name: role PK_b36bcfe02fc8de3c57a8b2391c2; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role
    ADD CONSTRAINT "PK_b36bcfe02fc8de3c57a8b2391c2" PRIMARY KEY (id);


--
-- Name: invitation PK_beb994737756c0f18a1c1f8669c; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invitation
    ADD CONSTRAINT "PK_beb994737756c0f18a1c1f8669c" PRIMARY KEY (id);


--
-- Name: doctor PK_ee6bf6c8de78803212c548fcb94; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctor
    ADD CONSTRAINT "PK_ee6bf6c8de78803212c548fcb94" PRIMARY KEY (id);


--
-- Name: specialize PK_ef973e2f3124d581fadc29d0ed5; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.specialize
    ADD CONSTRAINT "PK_ef973e2f3124d581fadc29d0ed5" PRIMARY KEY (id);


--
-- Name: doctor_clinic_maps PK_f3863b6032f2a9c75f95c29deb0; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctor_clinic_maps
    ADD CONSTRAINT "PK_f3863b6032f2a9c75f95c29deb0" PRIMARY KEY (id);


--
-- Name: employee REL_654aba9e02cc62ba0dfb5a4b82; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee
    ADD CONSTRAINT "REL_654aba9e02cc62ba0dfb5a4b82" UNIQUE (staff_info_id);


--
-- Name: doctor REL_b692823efe905fc26415442cf2; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctor
    ADD CONSTRAINT "REL_b692823efe905fc26415442cf2" UNIQUE (staff_info_id);


--
-- Name: staff_info UQ_42be60d0fed3b8948313f2117ab; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff_info
    ADD CONSTRAINT "UQ_42be60d0fed3b8948313f2117ab" UNIQUE (social_id);


--
-- Name: staff_info UQ_640d024ffd1e9d0a49e87e8c52c; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff_info
    ADD CONSTRAINT "UQ_640d024ffd1e9d0a49e87e8c52c" UNIQUE (staff_id);


--
-- Name: doctor_clinic_maps UQ_ea2b037fd760acf6c40ce8e168c; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctor_clinic_maps
    ADD CONSTRAINT "UQ_ea2b037fd760acf6c40ce8e168c" UNIQUE (doctor_id, clinic_id);


--
-- Name: doctor_service_link FK_02c093ef4c8e95cd3d7da4bb021; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctor_service_link
    ADD CONSTRAINT "FK_02c093ef4c8e95cd3d7da4bb021" FOREIGN KEY (doctor_id) REFERENCES public.doctor(id);


--
-- Name: doctor_workshift FK_12389a767f47898998444ff391b; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctor_workshift
    ADD CONSTRAINT "FK_12389a767f47898998444ff391b" FOREIGN KEY (doctor_clinic_link_id) REFERENCES public.doctor_clinic_maps(id);


--
-- Name: specialize FK_13769859465acf7a89d97526a7a; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.specialize
    ADD CONSTRAINT "FK_13769859465acf7a89d97526a7a" FOREIGN KEY (staff_info_id) REFERENCES public.staff_info(id) ON DELETE CASCADE;


--
-- Name: doctor_service_link FK_236fb2d70395fd8e580592f1c3e; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctor_service_link
    ADD CONSTRAINT "FK_236fb2d70395fd8e580592f1c3e" FOREIGN KEY (service_id) REFERENCES public.service(id);


--
-- Name: doctor_clinic_maps FK_24083243cee7a68c8c7a50a750e; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctor_clinic_maps
    ADD CONSTRAINT "FK_24083243cee7a68c8c7a50a750e" FOREIGN KEY (clinic_id) REFERENCES public.clinic(id);


--
-- Name: employee_role_link FK_373da4576a0e8ff8f2ad0795909; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_role_link
    ADD CONSTRAINT "FK_373da4576a0e8ff8f2ad0795909" FOREIGN KEY (role_id) REFERENCES public.role(id);


--
-- Name: invitation FK_3f126a3c5ae5cfc8a79887c9994; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invitation
    ADD CONSTRAINT "FK_3f126a3c5ae5cfc8a79887c9994" FOREIGN KEY (doctor_id) REFERENCES public.doctor(id);


--
-- Name: employee FK_654aba9e02cc62ba0dfb5a4b823; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee
    ADD CONSTRAINT "FK_654aba9e02cc62ba0dfb5a4b823" FOREIGN KEY (staff_info_id) REFERENCES public.staff_info(id);


--
-- Name: doctor_clinic_maps FK_78ee3d0c6fc72a1666917747835; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctor_clinic_maps
    ADD CONSTRAINT "FK_78ee3d0c6fc72a1666917747835" FOREIGN KEY (doctor_id) REFERENCES public.doctor(id);


--
-- Name: degree FK_7aab318862910270026ca4fa8da; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.degree
    ADD CONSTRAINT "FK_7aab318862910270026ca4fa8da" FOREIGN KEY (staff_info_id) REFERENCES public.staff_info(id) ON DELETE CASCADE;


--
-- Name: employee_role_link FK_9f8760d8158529359b01f0134ab; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_role_link
    ADD CONSTRAINT "FK_9f8760d8158529359b01f0134ab" FOREIGN KEY (employee_id) REFERENCES public.employee(id);


--
-- Name: doctor FK_b692823efe905fc26415442cf2a; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctor
    ADD CONSTRAINT "FK_b692823efe905fc26415442cf2a" FOREIGN KEY (staff_info_id) REFERENCES public.staff_info(id);


--
-- Name: clinic FK_e03384d243f674489547119242b; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clinic
    ADD CONSTRAINT "FK_e03384d243f674489547119242b" FOREIGN KEY ("ownerId") REFERENCES public.doctor(id);


--
-- PostgreSQL database dump complete
--

