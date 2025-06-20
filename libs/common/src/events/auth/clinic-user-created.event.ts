//event: clinic-user-created
export class ClinicUserCreated {
  public readonly id: string;
  public readonly email: string;
  public readonly actorType: string;
  public readonly clinicId: string;

  constructor(data: {
    id: string;
    email: string;
    actorType: string;
    clinicId: string;
  }) {
    this.id = data.id;
    this.email = data.email;
    this.actorType = data.actorType;
    this.clinicId = data.clinicId;
  }

  toString() {
    return JSON.stringify({
      id: this.id,
      email: this.email,
      actorType: this.actorType,
      clinicId: this.clinicId,
    });
  }
}

