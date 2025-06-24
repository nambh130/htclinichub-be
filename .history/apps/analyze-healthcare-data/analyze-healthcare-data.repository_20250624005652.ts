@Injectable()
export class PatientRepository extends MongoAbstractRepository<PatientDocument> {
  protected readonly logger = new Logger(PatientRepository.name);

  constructor(
    @InjectModel(Patient.name)
    patientModel: Model<PatientDocument>,
  ) {
    super(patientModel);
  }

  async findByPhone(phone: string) {
    const existPhone = await this.model.findOne({ phone });
    if (!existPhone) {
      return null;
    }
    return existPhone;
  }
