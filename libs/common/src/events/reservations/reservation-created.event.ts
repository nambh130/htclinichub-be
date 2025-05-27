export class ReservationCreatedEvent {
  constructor(
    public readonly reservationId: string,
    public readonly timestamp: Date,
    public readonly userId: string,
    public readonly placeId: string,
  ) {}

  toString() {
    return JSON.stringify({
      reservationId: this.reservationId,
      timestamp: this.timestamp,
      userId: this.userId,
      placeId: this.placeId,
    });
  }
}
