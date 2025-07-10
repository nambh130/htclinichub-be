//event: patient-created
export class InvitationCreated {
  public readonly to: string;
  public readonly roleName: string;
  public readonly clinicName: string;
  public readonly invitationUrl: string;

  constructor(data: {
    to: string;
    roleName: string;
    clinicName: string;
    invitationUrl: string;
  }) {
    this.to = data.to;
    this.invitationUrl = data.invitationUrl;
    this.roleName = data.roleName;
    this.clinicName = data.clinicName;
  }

  toString() {
    return JSON.stringify({
      to: this.to,
      invitationUrl: this.invitationUrl,
      roleName: this.roleName,
      clinicName: this.clinicName,
    });
  }
}

