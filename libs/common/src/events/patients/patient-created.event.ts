export class PatientCreatedEvent {
  constructor(
    public readonly patientId: string,
    public readonly timestamp: Date,
  ) {}

  toString() {
    return JSON.stringify({
      clinicId: this.patientId,
      timestamp: this.timestamp,
    });
  }
}
