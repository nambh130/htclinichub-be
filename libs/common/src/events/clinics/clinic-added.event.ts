export class ClinicAddedEvent {
  constructor(
    public readonly clinicId: string,
    public readonly timestamp: Date,
  ) {}

  toString() {
    return JSON.stringify({
      clinicId: this.clinicId,
      timestamp: this.timestamp,
    });
  }
}
