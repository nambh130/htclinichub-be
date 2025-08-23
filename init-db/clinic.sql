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
-- Name: clinic_schedule_rule_createdbytype_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.clinic_schedule_rule_createdbytype_enum AS ENUM (
    'doctor',
    'employee',
    'patient',
    'admin'
);


ALTER TYPE public.clinic_schedule_rule_createdbytype_enum OWNER TO postgres;

--
-- Name: clinic_schedule_rule_deletedbytype_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.clinic_schedule_rule_deletedbytype_enum AS ENUM (
    'doctor',
    'employee',
    'patient'
);


ALTER TYPE public.clinic_schedule_rule_deletedbytype_enum OWNER TO postgres;

--
-- Name: clinic_schedule_rule_updatedbytype_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.clinic_schedule_rule_updatedbytype_enum AS ENUM (
    'doctor',
    'employee',
    'patient',
    'admin'
);


ALTER TYPE public.clinic_schedule_rule_updatedbytype_enum OWNER TO postgres;

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
-- Name: medicine_category_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.medicine_category_enum AS ENUM (
    'Thuốc',
    'Thực phẩm chức năng',
    'Vaccine',
    'Dược mỹ phẩm',
    'Dung dịch tiêm truyền',
    'Hóa chất'
);


ALTER TYPE public.medicine_category_enum OWNER TO postgres;

--
-- Name: medicine_createdbytype_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.medicine_createdbytype_enum AS ENUM (
    'doctor',
    'employee',
    'patient',
    'admin'
);


ALTER TYPE public.medicine_createdbytype_enum OWNER TO postgres;

--
-- Name: medicine_deletedbytype_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.medicine_deletedbytype_enum AS ENUM (
    'doctor',
    'employee',
    'patient'
);


ALTER TYPE public.medicine_deletedbytype_enum OWNER TO postgres;

--
-- Name: medicine_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.medicine_status_enum AS ENUM (
    'DANG_SU_DUNG',
    'TAM_NGUNG',
    'NGUNG_LUU_HANH'
);


ALTER TYPE public.medicine_status_enum OWNER TO postgres;

--
-- Name: medicine_updatedbytype_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.medicine_updatedbytype_enum AS ENUM (
    'doctor',
    'employee',
    'patient',
    'admin'
);


ALTER TYPE public.medicine_updatedbytype_enum OWNER TO postgres;

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
    owner_id character varying(255),
    token character varying(255)
);


ALTER TABLE public.clinic OWNER TO postgres;

--
-- Name: clinic_schedule_rule; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.clinic_schedule_rule (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "createdById" character varying,
    "createdByType" public.clinic_schedule_rule_createdbytype_enum,
    "updatedById" character varying,
    "updatedByType" public.clinic_schedule_rule_updatedbytype_enum,
    "deletedAt" timestamp without time zone,
    "deletedById" character varying,
    "deletedByType" public.clinic_schedule_rule_deletedbytype_enum,
    duration interval NOT NULL,
    space integer NOT NULL,
    open_time interval,
    close_time interval,
    break_time interval,
    clinic_id uuid
);


ALTER TABLE public.clinic_schedule_rule OWNER TO postgres;

--
-- Name: medicine; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.medicine (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "createdById" character varying,
    "createdByType" public.medicine_createdbytype_enum,
    "updatedById" character varying,
    "updatedByType" public.medicine_updatedbytype_enum,
    "deletedAt" timestamp without time zone,
    "deletedById" character varying,
    "deletedByType" public.medicine_deletedbytype_enum,
    code character varying(50) NOT NULL,
    name character varying(255) NOT NULL,
    concentration character varying(100) NOT NULL,
    ingredient character varying(255) NOT NULL,
    unit character varying(50) NOT NULL,
    quantity integer NOT NULL,
    times_per_day integer NOT NULL,
    dose_per_time character varying(50) NOT NULL,
    schedule character varying(255) NOT NULL,
    "madeIn" character varying(255) NOT NULL,
    category public.medicine_category_enum NOT NULL,
    status public.medicine_status_enum DEFAULT 'DANG_SU_DUNG'::public.medicine_status_enum NOT NULL,
    clinic_id uuid
);


ALTER TABLE public.medicine OWNER TO postgres;

--
-- Data for Name: clinic; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.clinic (id, "createdAt", "updatedAt", "createdById", "createdByType", "updatedById", "updatedByType", "deletedAt", "deletedById", "deletedByType", name, location, phone, email, owner_id, token) FROM stdin;
280f44f6-162e-401f-90b6-f51644c6f951	2025-08-03 14:50:49.352327	2025-08-03 14:50:49.352327	8a52a315-04ee-4873-8b5a-cb32af73555b	\N	\N	\N	\N	\N	\N	Phòng khám Thiện Tâm	103 Trường Chinh, Tân Bình, TP.HCM	0901341962	thientam@hospital.com	256c8598-8834-4214-b24f-184dbc817ead	YWlwWtf8QJM_A132pNvCG6Oc6ajUtJ86
48804348-8656-4528-a069-8c3d3c8a1ea6	2025-08-03 14:52:02.953597	2025-08-03 14:52:02.953597	8a52a315-04ee-4873-8b5a-cb32af73555b	\N	\N	\N	\N	\N	\N	Phòng khám Sức Khỏe Mới	45 Đường D2, Bình Thạnh, TP.HCM	0901950693	suckhoemoi@hospital.com	cff1b9eb-a3ae-427d-a97b-e542257be9cb	wiGzFyODgD5_XjWedX_-6GhXdYFj7kOZ
ac0634ad-93e6-43e4-903b-e4f4e4b589a2	2025-08-03 14:53:59.977784	2025-08-03 14:53:59.977784	8a52a315-04ee-4873-8b5a-cb32af73555b	\N	\N	\N	\N	\N	\N	Phòng khám Tâm An	12 Nguyễn Văn Linh, Quận 7, TP.HCM	0901673264	taman@clinic.com	3bf90824-6cc3-4ce4-b30e-0a088c7817a8	csSWQavsrkIhSkRLWE7bS7q8MzHMmniz
2007befe-eabb-4c2b-9844-2280680130f5	2025-08-03 15:00:54.333182	2025-08-03 15:00:54.333182	8a52a315-04ee-4873-8b5a-cb32af73555b	\N	\N	\N	\N	\N	\N	Phòng khám Ánh Dương	88 Lê Văn Sỹ, Quận 3, TP.HCM	0901283697	anhduong.clinic@gmail.com	f164c821-99be-4ec5-83cb-5dbcd2a1f898	_-lB0GeTOAwJyoU2IMv59loFrS-IU6RF
\.


--
-- Data for Name: clinic_schedule_rule; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.clinic_schedule_rule (id, "createdAt", "updatedAt", "createdById", "createdByType", "updatedById", "updatedByType", "deletedAt", "deletedById", "deletedByType", duration, space, open_time, close_time, break_time, clinic_id) FROM stdin;
aa5eb020-5ee7-47a1-9a34-b7fdf9b1d945	2025-08-03 14:50:49.506138	2025-08-03 15:28:40.364045	\N	\N	\N	\N	\N	\N	\N	01:30:00	3	07:00:00	22:00:00	00:00:00	280f44f6-162e-401f-90b6-f51644c6f951
18a3c84d-a633-44ce-8801-f8d1fcb05cd5	2025-08-03 14:53:59.995498	2025-08-03 14:53:59.995498	\N	\N	\N	\N	\N	\N	\N	01:30:00	2	07:00:00	22:00:00	00:00:00	ac0634ad-93e6-43e4-903b-e4f4e4b589a2
643e39b7-265a-41ae-9cb6-57711bb0eb66	2025-08-03 15:00:54.396608	2025-08-03 15:00:54.396608	\N	\N	\N	\N	\N	\N	\N	01:30:00	2	07:00:00	22:00:00	00:00:00	2007befe-eabb-4c2b-9844-2280680130f5
a163504e-3134-4061-ac47-c65d762355c3	2025-08-03 14:52:02.987152	2025-08-03 14:52:02.987152	\N	\N	\N	\N	\N	\N	\N	01:30:00	2	07:00:00	22:00:00	00:00:00	48804348-8656-4528-a069-8c3d3c8a1ea6
\.


--
-- Data for Name: medicine; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.medicine (id, "createdAt", "updatedAt", "createdById", "createdByType", "updatedById", "updatedByType", "deletedAt", "deletedById", "deletedByType", code, name, concentration, ingredient, unit, quantity, times_per_day, dose_per_time, schedule, "madeIn", category, status, clinic_id) FROM stdin;
\.


--
-- Name: clinic_schedule_rule PK_006ce7d2bbdda2cab7013812564; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clinic_schedule_rule
    ADD CONSTRAINT "PK_006ce7d2bbdda2cab7013812564" PRIMARY KEY (id);


--
-- Name: clinic PK_8e97c18debc9c7f7606e311d763; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clinic
    ADD CONSTRAINT "PK_8e97c18debc9c7f7606e311d763" PRIMARY KEY (id);


--
-- Name: medicine PK_b9e0e6f37b7cadb5f402390928b; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medicine
    ADD CONSTRAINT "PK_b9e0e6f37b7cadb5f402390928b" PRIMARY KEY (id);


--
-- Name: clinic_schedule_rule REL_dc9c7dd830132d8b4fb5a05e8b; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clinic_schedule_rule
    ADD CONSTRAINT "REL_dc9c7dd830132d8b4fb5a05e8b" UNIQUE (clinic_id);


--
-- Name: medicine FK_80e11d5a802180847422363a6de; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medicine
    ADD CONSTRAINT "FK_80e11d5a802180847422363a6de" FOREIGN KEY (clinic_id) REFERENCES public.clinic(id);


--
-- Name: clinic_schedule_rule FK_dc9c7dd830132d8b4fb5a05e8b3; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clinic_schedule_rule
    ADD CONSTRAINT "FK_dc9c7dd830132d8b4fb5a05e8b3" FOREIGN KEY (clinic_id) REFERENCES public.clinic(id);


--
-- PostgreSQL database dump complete
--

