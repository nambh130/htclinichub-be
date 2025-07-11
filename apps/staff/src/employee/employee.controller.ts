import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Delete,
} from '@nestjs/common';
import { EmployeeService } from './employee.service';
import {
  CreateEmployeeAccountDto,
  EmployeeDegreeDto,
  EmployeeSpecializeDto,
  TokenPayload,
  UpdateDegreeDto,
  UpdateSpecializeDto,
  EmployeeProfileDto,
  UpdateProfileDto,
} from '@app/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller('staff/employee')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Get('account-list')
  getEmployeeAccountList(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.employeeService.getEmployeeAccountList(+page, +limit);
  }

  @Get('account-list-with-profile')
  getEmployeeListWithProfile(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('search') search?: string,
    @Query('searchField') searchField?: 'name' | 'email' | 'phone' | 'all',
  ) {
    return this.employeeService.getEmployeeListWithProfile(
      +page,
      +limit,
      search,
      searchField,
    );
  }

  @Get('details/:id')
  getEmployeeDetails(@Param('id') employeeId: string) {
    return this.employeeService.getStaffInfoByEmployeeId(employeeId);
  }

  @Get('employee-by-clinic/:clinicId')
  getEmployeeByClinic(@Param('clinicId') clinicId: string) {
    return this.employeeService.getEmployeeByClinic(clinicId);
  }

  @Get('employee-account-byId/:id')
  viewEmployeeAccountById(@Param('id') id: string) {
    return this.employeeService.getEmployeeAccountById(id);
  }

  @Get(':id')
  getEmployeeById(@Param('id') employeeId: string) {
    return this.employeeService.getEmployeeById(employeeId);
  }

  @Post('create-account')
  createEmployeeAccount(
    @Body()
    payload: {
      dto: CreateEmployeeAccountDto;
      currentUser: TokenPayload;
    },
  ) {
    return this.employeeService.createEmployeeAccount(
      payload.dto,
      payload.currentUser,
    );
  }

  @Post('lock')
  lockEmployeeAccount(
    @Body()
    payload: {
      id: string;
      currentUser: TokenPayload;
    },
  ) {
    return this.employeeService.lockEmployeeAccount(
      payload.id,
      payload.currentUser,
    );
  }

  @Post('unlock')
  unlockEmployeeAccount(
    @Body()
    payload: {
      id: string;
      currentUser: TokenPayload;
    },
  ) {
    return this.employeeService.unlockEmployeeAccount(
      payload.id,
      payload.currentUser,
    );
  }

  @Post('profile')
  getEmployeeProfile(
    @Body()
    payload: {
      employeeId: string;
    },
  ) {
    return this.employeeService.getStaffInfoByEmployeeId(payload.employeeId);
  }

  @Post('create-profile')
  createEmployeeProfile(
    @Body()
    payload: {
      staffId: string;
      dto: EmployeeProfileDto;
      currentUser: TokenPayload;
    },
  ) {
    return this.employeeService.createEmployeeProfile(
      payload.staffId,
      payload.dto,
      payload.currentUser,
    );
  }

  @Post('update-profile')
  async updateEmployeeProfile(
    @Body()
    body: {
      employeeId: string;
      dto: UpdateProfileDto;
      currentUser: TokenPayload;
    },
  ) {
    const { employeeId, dto, currentUser } = body;
    return this.employeeService.updateEmployeeProfile(
      employeeId,
      dto,
      currentUser,
    );
  }

  @Post('get-degrees')
  getDegreeList(
    @Body()
    payload: {
      employeeId: string;
    },
  ) {
    const { employeeId } = payload;
    return this.employeeService.getDegreeList(employeeId);
  }

  @Post('add-degree')
  addEmployeeDegree(
    @Body()
    payload: {
      employeeId: string;
      dto: EmployeeDegreeDto;
      currentUser: TokenPayload;
    },
  ) {
    const { employeeId, dto, currentUser } = payload;
    return this.employeeService.addEmployeeDegree(employeeId, dto, currentUser);
  }

  @Post('update-degree')
  updateEmployeeDegree(
    @Body()
    payload: {
      employeeId: string;
      degreeId: string;
      dto: UpdateDegreeDto;
      currentUser: TokenPayload;
    },
  ) {
    const { employeeId, degreeId, dto, currentUser } = payload;
    return this.employeeService.updateEmployeeDegree(
      employeeId,
      degreeId,
      dto,
      currentUser,
    );
  }

  @Post('delete-degree')
  deleteEmployeeDegree(
    @Body()
    payload: {
      employeeId: string;
      degreeId: string;
      currentUser: TokenPayload;
    },
  ) {
    const { employeeId, degreeId, currentUser } = payload;
    return this.employeeService.deleteEmployeeDegree(
      employeeId,
      degreeId,
      currentUser,
    );
  }

  @Post('get-specializes')
  getSpecializeList(
    @Body()
    payload: {
      employeeId: string;
    },
  ) {
    const { employeeId } = payload;
    return this.employeeService.getSpecializeList(employeeId);
  }

  @Post('add-specialize')
  addEmployeeSpecialize(
    @Body()
    payload: {
      employeeId: string;
      dto: EmployeeSpecializeDto;
      currentUser: TokenPayload;
    },
  ) {
    const { employeeId, dto, currentUser } = payload;
    return this.employeeService.addEmployeeSpecialize(
      employeeId,
      dto,
      currentUser,
    );
  }

  @Post('update-specialize')
  updateEmployeeSpecialize(
    @Body()
    payload: {
      employeeId: string;
      specializeId: string;
      dto: UpdateSpecializeDto;
      currentUser: TokenPayload;
    },
  ) {
    const { employeeId, specializeId, dto, currentUser } = payload;
    return this.employeeService.updateEmployeeSpecialize(
      employeeId,
      specializeId,
      dto,
      currentUser,
    );
  }

  @Post('delete-specialize')
  deleteEmployeeSpecialize(
    @Body()
    payload: {
      employeeId: string;
      specializeId: string;
      currentUser: TokenPayload;
    },
  ) {
    const { employeeId, specializeId, currentUser } = payload;
    return this.employeeService.deleteEmployeeSpecialize(
      employeeId,
      specializeId,
      currentUser,
    );
  }

  // Keep the message patterns for backward compatibility
  @MessagePattern('create-employee-account')
  createEmployeeAccountMessage(
    @Payload()
    payload: {
      dto: CreateEmployeeAccountDto;
      currentUser: TokenPayload;
    },
  ) {
    return this.employeeService.createEmployeeAccount(
      payload.dto,
      payload.currentUser,
    );
  }

  @MessagePattern('lock-employee-account')
  async lockEmployeeAccountMessage(
    @Payload()
    data: {
      id: string;
      currentUser: TokenPayload;
    },
  ) {
    return this.employeeService.lockEmployeeAccount(data.id, data.currentUser);
  }

  @MessagePattern('unlock-employee-account')
  async unlockEmployeeAccountMessage(
    @Payload()
    data: {
      id: string;
      currentUser: TokenPayload;
    },
  ) {
    return this.employeeService.unlockEmployeeAccount(
      data.id,
      data.currentUser,
    );
  }

  @Post('assign-clinic')
  assignEmployeeToClinic(
    @Body()
    payload: {
      employeeId: string;
      clinicId: string;
      currentUser: TokenPayload;
    },
  ) {
    const { employeeId, clinicId, currentUser } = payload;
    return this.employeeService.assignEmployeeToClinic(
      employeeId,
      clinicId,
      currentUser,
    );
  }

  @Delete('clinic')
  removeEmployeeFromClinic(
    @Body()
    payload: {
      employeeId: string;
      currentUser: TokenPayload;
    },
  ) {
    const { employeeId, currentUser } = payload;
    return this.employeeService.removeEmployeeFromClinic(
      employeeId,
      currentUser,
    );
  }
}
