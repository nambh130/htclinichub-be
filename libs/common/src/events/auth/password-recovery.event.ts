//event: patient-created
export class PwdRecoveryEvent {
  public readonly to: string;
  public readonly resetLink: string;

  constructor(data: { to: string; resetLink: string }) {
    this.to = data.to;
    this.resetLink = data.resetLink;
  }

  toString() {
    return JSON.stringify({
      to: this.to,
      resetLink: this.resetLink,
    });
  }
}
