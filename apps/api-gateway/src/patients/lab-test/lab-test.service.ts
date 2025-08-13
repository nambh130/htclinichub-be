import { LAB_TEST_SERVICE, PATIENT_SERVICE } from '@app/common';
import { HttpService } from '@nestjs/axios';
import { HttpException, Inject, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { catchError, firstValueFrom } from 'rxjs';

@Injectable()
export class LabTestService {
  constructor(
    @Inject(PATIENT_SERVICE) private readonly httpService: HttpService,
  ) {}

  // ==================================
  //  LAB FIELDS FOR QUANTITATIVE TESTS
  // ==================================
  async createLabField(req: Request) {
    const cookie = req.headers.cookie; // Grab incoming cookies

    const response = await firstValueFrom(
      this.httpService
        .post(`/lab-test/lab-field`, req.body, {
          headers: {
            Cookie: cookie, // Forward the original cookie
          },
          withCredentials: true, // optional but doesn't hurt
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

  async updateLabField(id: string, req: Request) {
    const cookie = req.headers.cookie; // Grab incoming cookies

    const response = await firstValueFrom(
      this.httpService
        .patch(`/lab-test/lab-field/${id}`, req.body, {
          headers: {
            Cookie: cookie, // Forward the original cookie
          },
          withCredentials: true, // optional but doesn't hurt
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

  async deleteLabField(id: string, req: Request) {
    const cookie = req.headers.cookie; // Grab incoming cookies

    const response = await firstValueFrom(
      this.httpService
        .delete(`/lab-test/lab-field/${id}`, {
          headers: {
            Cookie: cookie, // Forward the original cookie
          },
          withCredentials: true, // optional but doesn't hurt
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

  async getLabField(query: Record<string, any>, req: Request) {
    const queryString = new URLSearchParams(query).toString();

    const response = await firstValueFrom(
      this.httpService.get(`/lab-test/lab-field?${queryString}`, {
        headers: {
          Cookie: req.headers.cookie || '', // Forward incoming cookies
        },
        withCredentials: true,
      }),
    );

    return response.data;
  }

  // ==================================
  //  ALL TESTS
  // ==================================
  async findLabTest(query: Record<string, any>, req: Request) {
    const queryString = new URLSearchParams(query).toString();

    const response = await firstValueFrom(
      this.httpService.get(`/lab-test?${queryString}`, {
        headers: {
          Cookie: req.headers.cookie || '', // Forward incoming cookies
        },
        withCredentials: true,
      }),
    );

    return response.data;
  }

  async deleteTest(id: string, req: Request) {
    const cookie = req.headers.cookie; // Grab incoming cookies

    const response = await firstValueFrom(
      this.httpService
        .delete(
          `/lab-test/${id}`,
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

  // ==================================
  //  QUANTITATIVE TESTS
  // ==================================
  async getQuantitativeById(
    id: string,
    query: Record<string, any>,
    req: Request,
  ) {
    const queryString = new URLSearchParams(query).toString();

    const response = await firstValueFrom(
      this.httpService.get(`/lab-test/quantitative/${id}?${queryString}`, {
        headers: {
          Cookie: req.headers.cookie || '', // Forward incoming cookies
        },
        withCredentials: true,
      }),
    );

    return response.data;
  }

  async createQuantitativeTest(req: Request) {
    const cookie = req.headers.cookie; // Grab incoming cookies

    const response = await firstValueFrom(
      this.httpService
        .post(`/lab-test/quantitative`, req.body, {
          headers: {
            Cookie: cookie, // Forward the original cookie
          },
          withCredentials: true, // optional but doesn't hurt
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

  async updateQuantitativeTest(id: string, req: Request) {
    const cookie = req.headers.cookie; // Grab incoming cookies

    const response = await firstValueFrom(
      this.httpService
        .patch(`/lab-test/quantitative/${id}`, req.body, {
          headers: {
            Cookie: cookie, // Forward the original cookie
          },
          withCredentials: true, // optional but doesn't hurt
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

  async deleteQuantitativeTest(id: string, req: Request) {
    const cookie = req.headers.cookie; // Grab incoming cookies

    const response = await firstValueFrom(
      this.httpService
        .delete(`/lab-test/quantitative/${id}`, {
          headers: {
            Cookie: cookie, // Forward the original cookie
          },
          withCredentials: true, // optional but doesn't hurt
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
  // ==================================
  //  IMAGING TESTS
  // ==================================
  async createImagingTest(req: Request) {
    const cookie = req.headers.cookie;

    const response = await firstValueFrom(
      this.httpService
        .post('/lab-test/imaging', req.body, {
          headers: {
            Cookie: cookie || '',
          },
          withCredentials: true,
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

  async getImagingTestById(id: string, req: Request) {
    const response = await firstValueFrom(
      this.httpService.get(`/lab-test/imaging/${id}?`, {
        headers: {
          Cookie: req.headers.cookie || '',
        },
        withCredentials: true,
      }),
    );

    return response.data;
  }

  async updateImagingTest(id: string, req: Request) {
    const cookie = req.headers.cookie;

    const response = await firstValueFrom(
      this.httpService
        .patch(`/lab-test/imaging/${id}`, req.body, {
          headers: {
            Cookie: cookie || '',
          },
          withCredentials: true,
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
}
