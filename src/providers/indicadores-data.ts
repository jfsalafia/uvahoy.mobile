import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable()
export class IndicadoresData {

  serviceUrl: string= '/api/';

  constructor(public httpClient: HttpClient) { 

  }

  getIndicadores() {
    return this.httpClient.get(this.serviceUrl + 'GetList');
  }

  getCotizaciones(id: number, fechaDesde: string, fechaHasta: string) {
    let params: HttpParams = new HttpParams()
    .set('IndicadorId', id.toString())
    .set('FechaDesde', fechaDesde)
    .set('FechaHasta', fechaHasta);

    var apiUrl = this.serviceUrl + 'GetIndicadorDetail';

    return this.httpClient.get(apiUrl, {params: params});
  }
}
