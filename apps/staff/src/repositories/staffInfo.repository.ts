import { Injectable, Logger } from '@nestjs/common';
import { PostgresAbstractRepository } from '@app/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { StaffInfo } from '../models/staffInfo.entity';

@Injectable()
export class StaffInfoRepository extends PostgresAbstractRepository<StaffInfo> {
  protected readonly logger = new Logger(StaffInfoRepository.name);

  private readonly itemsRepository: Repository<StaffInfo>;

  constructor(
    @InjectRepository(StaffInfo)
    itemsRepository: Repository<StaffInfo>,
    entityManager: EntityManager,
  ) {
    super(itemsRepository, entityManager);
    this.itemsRepository = itemsRepository;
  }

  async checkStaffInfoExists(staffId: string): Promise<boolean> {
    try {
      const staffInfo = await this.itemsRepository.findOne({
        where: { staff_id: staffId },
      });
      return staffInfo !== null;
    } catch (error) {
      this.logger.error(
        `Error checking staff info existence for ${staffId}:`,
        error,
      );
      throw error;
    }
  }
}
