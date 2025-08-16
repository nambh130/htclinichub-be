import { PATIENT_SERVICE } from '@app/common';
import { HttpService } from '@nestjs/axios';
import { HttpException, Inject, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { catchError, firstValueFrom } from 'rxjs';

@Injectable()
export class LabOrderService {
  constructor(
    @Inject(PATIENT_SERVICE) private readonly httpService: HttpService,
  ) {}

  async createLabOrder(req: Request) {
    const cookie = req.headers.cookie;

    const response = await firstValueFrom(
      this.httpService
        .post(`/lab-order`, req.body, {
          headers: {
            Cookie: cookie, // Forward the original cookie
          },
        })
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

  async updateOrderItemStatus(req: Request, id: string) {
    const cookie = req.headers.cookie;

    const response = await firstValueFrom(
      this.httpService
        .patch(`/lab-order/item/${id}/status`, req.body, {
          headers: {
            Cookie: cookie,
          },
        })
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

  async getLabOrderByClinictId(query: Record<string, any>, req: Request) {
    const queryString = new URLSearchParams(query).toString();

    const response = await firstValueFrom(
      this.httpService.get(`/lab-order/by-clinic?${queryString}`, {
        headers: {
          Cookie: req.headers.cookie || '', // Forward incoming cookies
        },
        withCredentials: true,
      }),
    );

    return response.data;
  }

  async getOrderItemById(req: Request, id: string) {
    const response = await firstValueFrom(
      this.httpService.get(`/lab-order/item/${id}`, {
        headers: {
          Cookie: req.headers.cookie || '',
        },
        withCredentials: true,
      }),
    );

    return response.data;
  }

  async getOrderItemQuantResult(req: Request, id: string) {
    const response = await firstValueFrom(
      this.httpService.get(`/lab-order/item/${id}/quantitative-result`, {
        headers: {
          Cookie: req.headers.cookie || '',
        },
        withCredentials: true,
      }),
    );

    return response.data;
  }

  async getOrderItemImagingResult(req: Request, id: string) {
    const response = await firstValueFrom(
      this.httpService.get(`/lab-order/item/${id}/imaging-result`, {
        headers: {
          Cookie: req.headers.cookie || '',
        },
        withCredentials: true,
      }),
    );

    return response.data;
  }

  async saveQuantitativeResult(req: Request) {
    const cookie = req.headers.cookie;

    const response = await firstValueFrom(
      this.httpService
        .post(`/lab-order/item/quantitative-result`, req.body, {
          headers: {
            Cookie: cookie, // Forward the original cookie
          },
        })
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

  async saveImagingResult(req: Request, payload: any) {
    const cookie = req.headers.cookie;

    const response = await firstValueFrom(
      this.httpService
        .post(`/lab-order/item/imaging-result`, payload, {
          headers: {
            Cookie: cookie, // Forward the original cookie
          },
        })
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

  // RESULT FILE

  async addResultFile(req: Request, payload: any) {
    const cookie = req.headers.cookie;

    const response = await firstValueFrom(
      this.httpService
        .post(`/lab-order/item/result-file/add`, payload, {
          headers: {
            Cookie: cookie,
          },
        })
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

  async removeResultFile(req: Request) {
    const cookie = req.headers.cookie;

    const response = await firstValueFrom(
      this.httpService
        .post(`/lab-order/item/result-file/remove`, req.body, {
          headers: {
            Cookie: cookie,
          },
        })
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
  async getManyQuantResultByOrderItems(req: Request, id: string) {
    const response = await firstValueFrom(
      this.httpService.get(`/lab-order/${id}/quantitative-result`, {
        headers: {
          Cookie: req.headers.cookie || '',
        },
        withCredentials: true,
      }),
    );

    return response.data;
  }
}
