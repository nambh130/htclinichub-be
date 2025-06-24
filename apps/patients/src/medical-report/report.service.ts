import { Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';


export class ReportService {
    async generatePdf(data: {
        name: string;
        dob: string;
        id: number;
        date: string;
        diagnosis: string;
    }): Promise<Buffer> {
        const htmlPath = path.join(process.cwd(), 'medical-report', 'templates', 'medical_report.html');
        let html = fs.readFileSync(htmlPath, 'utf8');

        html = html
            .replace('{{name}}', data.name)
            .replace('{{dob}}', data.dob)
            .replace('{{id}}', data.id.toString())
            .replace('{{date}}', data.date)
            .replace('{{diagnosis}}', data.diagnosis);

        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });

        const pdfBuffer: Buffer = await page.pdf({
            format: 'A4',
            printBackground: true,
        }) as Buffer;

        await browser.close();
        return pdfBuffer; // ✅ THÊM DÒNG NÀY
    }
}