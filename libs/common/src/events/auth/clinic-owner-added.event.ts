//event: clinic-owner-added
export class ClinicOwnerAdded {
  public readonly clinicId: string;
  public readonly ownerId: string;

  constructor(data: {
    clinicId: string,
    ownerId: string
  }) {
    this.clinicId = data.clinicId;
    this.ownerId = data.ownerId;
  }

  toString() {
    return JSON.stringify({
      clinicId: this.clinicId,
      onwerId: this.ownerId,
    });
  }
}


