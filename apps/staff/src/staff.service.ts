import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { IsNull } from 'typeorm';
import {
  StaffMember,
  StaffQueryResult,
  PaginatedStaffResponse,
  GetClinicStaffQuery,
} from '@app/common';
import { DoctorRepository } from './repositories/doctor.repository';
import { EmployeeRepository } from './repositories/employee.repository';
import { StaffInfoRepository } from './repositories/staffInfo.repository';
import { DoctorClinicMap } from './models/doctor-clinic-map.entity';

@Injectable()
export class StaffService {
  constructor(
    private readonly doctorRepository: DoctorRepository,
    private readonly employeeRepository: EmployeeRepository,
    private readonly staffInfoRepository: StaffInfoRepository,
  ) {}

  async getClinicStaff(
    clinicId: string,
    query: GetClinicStaffQuery,
  ): Promise<PaginatedStaffResponse> {
    try {
      let doctorResults: StaffMember[] = [];
      let employeeResults: StaffMember[] = [];
      let totalDoctors = 0;
      let totalEmployees = 0;

      // Ensure limit and offset have default values
      const limit = query.limit ?? 10;
      const offset = query.offset ?? 0;

      // Get doctors if requested
      if (query.type === 'all' || query.type === 'doctor') {
        const doctorData = await this.getDoctorsByClinic(clinicId, query);
        doctorResults = doctorData.data;
        totalDoctors = doctorData.total;
      }

      // Get employees if requested
      if (query.type === 'all' || query.type === 'employee') {
        const employeeData = await this.getEmployeesByClinic(clinicId, query);
        employeeResults = employeeData.data;
        totalEmployees = employeeData.total;
      }

      // Combine and apply pagination if showing all
      let allStaff: StaffMember[] = [...doctorResults, ...employeeResults];
      const totalStaff = totalDoctors + totalEmployees;

      // Apply pagination to combined results if showing all types
      if (query.type === 'all') {
        // Sort by type (doctors first) and then by email for consistent ordering
        allStaff.sort((a, b) => {
          if (a.type !== b.type) {
            return a.type === 'doctor' ? -1 : 1;
          }
          return a.account.email.localeCompare(b.account.email);
        });

        // Apply pagination to combined results
        allStaff = allStaff.slice(offset, offset + limit);
      }

      const hasMore = offset + limit < totalStaff;

      return {
        clinicId,
        data: {
          doctors:
            query.type === 'all'
              ? doctorResults
              : query.type === 'doctor'
                ? doctorResults
                : [],
          employees:
            query.type === 'all'
              ? employeeResults
              : query.type === 'employee'
                ? employeeResults
                : [],
          allStaff,
        },
        pagination: {
          total: totalStaff,
          totalDoctors,
          totalEmployees,
          limit,
          offset,
          hasMore,
        },
        filters: query,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to retrieve clinic staff');
    }
  }

  private async getDoctorsByClinic(
    clinicId: string,
    query: GetClinicStaffQuery,
  ): Promise<StaffQueryResult> {
    // Build the query for doctors
    const doctorQuery = this.doctorRepository.repo.manager
      .getRepository(DoctorClinicMap)
      .createQueryBuilder('doctorClinicMap')
      .innerJoinAndSelect('doctorClinicMap.doctor', 'doctor')
      .where('doctorClinicMap.clinic = :clinicId', { clinicId });

    // Note: Search filtering is done in JavaScript after fetching to support searchBy parameter

    const doctorClinicMaps = await doctorQuery.getMany();
    const doctors = doctorClinicMaps.map((map) => map.doctor);

    // Get doctors with their staff info
    const doctorResults = await Promise.all(
      doctors.map(async (doctor): Promise<StaffMember> => {
        const staffInfo = await this.staffInfoRepository.findOne({
          staff_id: doctor.id,
          deletedAt: IsNull(),
          deletedById: IsNull(),
          deletedByType: IsNull(),
        });

        return {
          type: 'doctor',
          account: {
            id: doctor.id,
            email: doctor.email,
            is_locked: doctor.is_locked,
          },
          info: staffInfo
            ? {
                staff_id: staffInfo.staff_id,
                full_name: staffInfo.full_name,
                dob: staffInfo.dob,
                phone: staffInfo.phone,
                gender: staffInfo.gender,
                position: staffInfo.position,
                profile_img_id: staffInfo.profile_img_id,
              }
            : null,
        };
      }),
    );

    // Apply additional search on staff info
    const filteredDoctors = doctorResults.filter((result) => {
      if (!query.search) return true;

      const searchLower = query.search.toLowerCase();
      const searchBy = query.searchBy;

      // Apply search based on searchBy parameter
      if (searchBy === 'email') {
        return result.account.email.toLowerCase().includes(searchLower);
      }

      if (searchBy === 'name') {
        if (!result.info || !result.info.full_name) return false;
        return result.info.full_name.toLowerCase().includes(searchLower);
      }

      if (searchBy === 'phone') {
        if (!result.info || !result.info.phone) return false;
        return result.info.phone.toLowerCase().includes(searchLower);
      }

      // Default to 'all' - search in all fields
      const matchesEmail = result.account.email
        .toLowerCase()
        .includes(searchLower);

      if (result.info) {
        const matchesName = result.info.full_name
          ?.toLowerCase()
          .includes(searchLower);
        const matchesPhone = result.info.phone
          ?.toLowerCase()
          .includes(searchLower);

        return matchesEmail || matchesName || matchesPhone;
      }

      return matchesEmail;
    });

    // Apply pagination for doctors only
    if (query.type === 'doctor') {
      const limit = query.limit ?? 10;
      const offset = query.offset ?? 0;
      const paginatedDoctors = filteredDoctors.slice(offset, offset + limit);
      return { data: paginatedDoctors, total: filteredDoctors.length };
    }

    return { data: filteredDoctors, total: filteredDoctors.length };
  }

  private async getEmployeesByClinic(
    clinicId: string,
    query: GetClinicStaffQuery,
  ): Promise<StaffQueryResult> {
    // Get employees by clinic
    const employees = await this.employeeRepository.find({
      clinic_id: clinicId,
      deletedAt: IsNull(),
      deletedById: IsNull(),
      deletedByType: IsNull(),
    });

    // Get employees with their staff info
    const employeeResults = await Promise.all(
      employees.map(async (employee): Promise<StaffMember> => {
        const staffInfo = await this.staffInfoRepository.findOne({
          staff_id: employee.id,
          deletedAt: IsNull(),
          deletedById: IsNull(),
          deletedByType: IsNull(),
        });

        return {
          type: 'employee',
          account: {
            id: employee.id,
            email: employee.email,
            is_locked: employee.is_locked,
            clinic_id: employee.clinic_id,
          },
          info: staffInfo
            ? {
                staff_id: staffInfo.staff_id,
                full_name: staffInfo.full_name,
                dob: staffInfo.dob,
                phone: staffInfo.phone,
                gender: staffInfo.gender,
                position: staffInfo.position,
                profile_img_id: staffInfo.profile_img_id,
              }
            : null,
        };
      }),
    );

    // Apply search filter on employee data
    const filteredEmployeeResults = employeeResults.filter((result) => {
      if (!query.search) return true;

      const searchLower = query.search.toLowerCase();
      const searchBy = query.searchBy;

      // Apply search based on searchBy parameter
      if (searchBy === 'email') {
        return result.account.email.toLowerCase().includes(searchLower);
      }

      if (searchBy === 'name') {
        if (!result.info || !result.info.full_name) return false;
        return result.info.full_name.toLowerCase().includes(searchLower);
      }

      if (searchBy === 'phone') {
        if (!result.info || !result.info.phone) return false;
        return result.info.phone.toLowerCase().includes(searchLower);
      }

      // Default to 'all' - search in all fields
      const matchesEmail = result.account.email
        .toLowerCase()
        .includes(searchLower);

      if (result.info) {
        const matchesName = result.info.full_name
          ?.toLowerCase()
          .includes(searchLower);
        const matchesPhone = result.info.phone
          ?.toLowerCase()
          .includes(searchLower);

        return matchesEmail || matchesName || matchesPhone;
      }

      return matchesEmail;
    });

    // Apply pagination for employees only
    if (query.type === 'employee') {
      const limit = query.limit ?? 10;
      const offset = query.offset ?? 0;
      const paginatedEmployees = filteredEmployeeResults.slice(
        offset,
        offset + limit,
      );
      return {
        data: paginatedEmployees,
        total: filteredEmployeeResults.length,
      };
    }

    return {
      data: filteredEmployeeResults,
      total: filteredEmployeeResults.length,
    };
  }
}
