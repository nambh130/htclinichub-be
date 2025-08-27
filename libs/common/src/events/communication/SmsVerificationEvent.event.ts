export class SmsVerificationEvent {
  public readonly phoneNumber: string;
  public readonly code: string;

  constructor(data: {phoneNumber: string, code: string}){
    this.code = data.code;
    this.phoneNumber = data.phoneNumber;
  }

  toString(){
    return JSON.stringify({
      phoneNumber: this.phoneNumber,
      code: this.code
    })
  }
}
