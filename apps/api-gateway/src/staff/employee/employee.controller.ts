import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Query,
  Delete,
} from '@nestjs/common';
import { EmployeeService } from './employee.service';
import {
  CreateEmployeeAccountDto,
  CurrentUser,
  EmployeeDegreeDto,
  EmployeeSpecializeDto,
  EmployeeProfileDto,
  JwtAuthGuard,
  TokenPayload,
  UpdateDegreeDto,
  UpdateSpecializeDto,
  UpdateProfileDto,
} from '@app/common';

@Controller('staff/employee')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  // ============================================================================
  // EMPLOYEE ACCOUNT MANAGEMENT
  // ============================================================================

  @Get('account-list')
  @UseGuards(JwtAuthGuard)
  async getEmployeeAccountList(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.employeeService.getEmployeeAccountList(+page, +limit);
  }

  @Get('account-list-with-profile')
  @UseGuards(JwtAuthGuard)
  async getEmployeeListWithProfile(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('search') search?: string,
    @Query('searchField') searchField?: 'name' | 'email' | 'phone' | 'all',
    @Query('clinicId') clinicId?: string,
  ) {
    return await this.employeeService.getEmployeeListWithProfile(
      +page,
      +limit,
      search,
      searchField,
      clinicId,
    );
  }

  @Get('employee-by-clinic/:clinicId')
  @UseGuards(JwtAuthGuard)
  async getEmployeeByClinic(@Param('clinicId') clinicId: string) {
    return this.employeeService.getEmployeeByClinic(clinicId);
  }

  @Get('details/:id')
  @UseGuards(JwtAuthGuard)
  async getEmployeeDetailsById(@Param('id') employeeId: string) {
    return await this.employeeService.getEmployeeDetailsById(employeeId);
  }

  @Post('create-account')
  @UseGuards(JwtAuthGuard)
  async createEmployeeAccount(
    @Body() dto: CreateEmployeeAccountDto,
    @CurrentUser() currentUser: TokenPayload,
  ) {
    return this.employeeService.createEmployeeAccount(dto, currentUser);
  }

  @Post('lock/:id')
  @UseGuards(JwtAuthGuard)
  async lockEmployeeAccount(
    @Param('id') id: string,
    @CurrentUser() currentUser: TokenPayload,
  ) {
    return this.employeeService.lockEmployeeAccount(id, currentUser);
  }

  @Post('unlock/:id')
  @UseGuards(JwtAuthGuard)
  async unlockEmployeeAccount(
    @Param('id') id: string,
    @CurrentUser() currentUser: TokenPayload,
  ) {
    return this.employeeService.unlockEmployeeAccount(id, currentUser);
  }

  // ============================================================================
  // EMPLOYEE PROFILE MANAGEMENT
  // ============================================================================

  @Get(':id/profile')
  @UseGuards(JwtAuthGuard)
  async getStaffInfoByEmployeeId(@Param('id') employeeId: string) {
    return this.employeeService.getStaffInfoByEmployeeId(employeeId);
  }

  @Post(':id/create-profile')
  @UseGuards(JwtAuthGuard)
  async createEmployeeProfile(
    @Param('id') staffId: string,
    @Body() dto: EmployeeProfileDto,
    @CurrentUser() currentUser: TokenPayload,
  ) {
    return this.employeeService.createEmployeeProfile(
      staffId,
      dto,
      currentUser,
    );
  }

  @Post(':id/update-profile')
  @UseGuards(JwtAuthGuard)
  async updateEmployeeProfile(
    @Param('id') employeeId: string,
    @Body() dto: UpdateProfileDto,
    @CurrentUser() currentUser: TokenPayload,
  ) {
    return this.employeeService.updateEmployeeProfile(
      employeeId,
      dto,
      currentUser,
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getEmployeeById(@Param('id') employeeId: string) {
    return await this.employeeService.getEmployeeById(employeeId);
  }

  // ============================================================================
  // EMPLOYEE DEGREES MANAGEMENT
  // ============================================================================

  @Get(':id/degrees')
  @UseGuards(JwtAuthGuard)
  getDegreesByEmployeeId(@Param('id') employeeId: string) {
    return this.employeeService.getDegreesByEmployeeId(employeeId);
  }

  @Post(':id/add-degree')
  @UseGuards(JwtAuthGuard)
  addEmployeeDegree(
    @Param('id') employeeId: string,
    @Body() dto: EmployeeDegreeDto,
    @CurrentUser() currentUser: TokenPayload,
  ) {
    return this.employeeService.addEmployeeDegree(employeeId, dto, currentUser);
  }

  @Post(':id/update-degree/:degreeId')
  @UseGuards(JwtAuthGuard)
  updateEmployeeDegree(
    @Param('id') employeeId: string,
    @Param('degreeId') degreeId: string,
    @Body() dto: UpdateDegreeDto,
    @CurrentUser() currentUser: TokenPayload,
  ) {
    return this.employeeService.updateEmployeeDegree(
      employeeId,
      degreeId,
      dto,
      currentUser,
    );
  }

  @Delete(':id/delete-degree/:degreeId')
  @UseGuards(JwtAuthGuard)
  deleteEmployeeDegree(
    @Param('id') employeeId: string,
    @Param('degreeId') degreeId: string,
    @CurrentUser() currentUser: TokenPayload,
  ) {
    return this.employeeService.deleteEmployeeDegree(
      employeeId,
      degreeId,
      currentUser,
    );
  }

  // ============================================================================
  // EMPLOYEE SPECIALIZATIONS MANAGEMENT
  // ============================================================================

  @Get(':id/specializes')
  @UseGuards(JwtAuthGuard)
  getSpecializesByEmployeeId(@Param('id') employeeId: string) {
    return this.employeeService.getSpecializesByEmployeeId(employeeId);
  }

  @Post(':id/add-specialize')
  @UseGuards(JwtAuthGuard)
  addEmployeeSpecialize(
    @Param('id') employeeId: string,
    @Body() dto: EmployeeSpecializeDto,
    @CurrentUser() currentUser: TokenPayload,
  ) {
    return this.employeeService.addEmployeeSpecialize(
      employeeId,
      dto,
      currentUser,
    );
  }

  @Post(':id/update-specialize/:specializeId')
  @UseGuards(JwtAuthGuard)
  updateEmployeeSpecialize(
    @Param('id') employeeId: string,
    @Param('specializeId') specializeId: string,
    @Body() dto: UpdateSpecializeDto,
    @CurrentUser() currentUser: TokenPayload,
  ) {
    return this.employeeService.updateEmployeeSpecialize(
      employeeId,
      specializeId,
      dto,
      currentUser,
    );
  }

  @Delete(':id/delete-specialize/:specializeId')
  @UseGuards(JwtAuthGuard)
  deleteEmployeeSpecialize(
    @Param('id') employeeId: string,
    @Param('specializeId') specializeId: string,
    @CurrentUser() currentUser: TokenPayload,
  ) {
    return this.employeeService.deleteEmployeeSpecialize(
      employeeId,
      specializeId,
      currentUser,
    );
  }

  @Get('employee-account-byId/:id')
  @UseGuards(JwtAuthGuard)
  async getEmployeeAccountById(@Param('id') id: string) {
    return this.employeeService.getEmployeeAccountById(id);
  }

  // ============================================================================
  // CLINIC ASSIGNMENT
  // ============================================================================

  @Post(':id/assign-clinic/:clinicId')
  @UseGuards(JwtAuthGuard)
  async assignEmployeeToClinic(
    @Param('id') employeeId: string,
    @Param('clinicId') clinicId: string,
    @CurrentUser() currentUser: TokenPayload,
  ) {
    return await this.employeeService.assignEmployeeToClinic(
      employeeId,
      clinicId,
      currentUser,
    );
  }

  @Post(':id/remove-clinic')
  @UseGuards(JwtAuthGuard)
  async removeEmployeeFromClinic(
    @Param('id') employeeId: string,
    @Body() payload: { clinicId: string },
  ) {
    return await this.employeeService.removeEmployeeFromClinic(
      employeeId,
      payload.clinicId,
    );
  }
}
