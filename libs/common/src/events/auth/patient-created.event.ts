//event: patient-created
export class PatientCreated {
  public readonly id: string;
  public readonly phone: string;
  public readonly status: string;
  public readonly createdAt: Date;

  constructor(data: {
    id: string;
    phone: string;
    status: string;
    createdAt: Date;
  }) {
    this.id = data.id;
    this.phone = data.phone;
    this.status = data.status;
    this.createdAt = data.createdAt;
  }

  toString() {
    return JSON.stringify({
      id: this.id,
      phone: this.phone,
      status: this.status,
      createdAt: this.createdAt,
    });
  }
}
