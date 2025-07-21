import { PATIENT_SERVICE } from "@app/common";
import { HttpService } from "@nestjs/axios";
import { HttpException, Inject, Injectable } from "@nestjs/common";
import { Request } from "express";
import { catchError, firstValueFrom } from "rxjs";

@Injectable()
export class LabOrderService {
  constructor(
    @Inject(PATIENT_SERVICE) private readonly httpService: HttpService,
  ) { }

  async createLabField(req: Request) {
    const cookie = req.headers.cookie; // Grab incoming cookies

    const response = await firstValueFrom(
      this.httpService
        .post(
          `/lab-order`,
          req.body,
          {
            headers: {
              Cookie: cookie, // Forward the original cookie
            },
            withCredentials: true, // optional but doesn't hurt
          },
        )
        .pipe(
          catchError((error) => {
            const e = error.response;
            throw new HttpException(
              e?.data || 'Upstream error',
              e?.status || 500,
            );
          }),
        ),
    );
    return response.data;
  }

  async getLabOrderByReportId(query: Record<string, any>, req: Request) {
    const queryString = new URLSearchParams(query).toString();

    const response = await firstValueFrom(
      this.httpService.get(`/lab-order?${queryString}`, {
        headers: {
          Cookie: req.headers.cookie || '', // Forward incoming cookies
        },
        withCredentials: true,
      }),
    );

    return response.data;
  }
}
