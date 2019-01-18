import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ENV } from '@app/env';

@Injectable()
export class IndicadoresData {

  serviceUrl: string = ENV.apiUrl;
  mode: string = ENV.mode;

  constructor(public httpClient: HttpClient) {

  };

  getIndicadores() {
    return this.httpClient.get(this.serviceUrl + 'GetList');
  };

  getCotizaciones(id: number, fechaDesde: string, fechaHasta: string) {
    let params: HttpParams = new HttpParams()
      .set('IndicadorId', id.toString())
      .set('FechaDesde', fechaDesde)
      .set('FechaHasta', fechaHasta);

    var apiUrl = this.serviceUrl + 'GetIndicadorDetail';

    return this.httpClient.get(apiUrl, { params: params });
  };

  getMultiIndicadorCotizaciones(indicadores: string, fechas: string) {
    let params: HttpParams = new HttpParams()
      .set('Indicadores', indicadores)
      .set('Fechas', fechas)
      .set('Separador', ',');

    var apiUrl = this.serviceUrl + 'GetMultiIndicadorDetail';

    return this.httpClient.get(apiUrl, { params: params });
  };

  getCalculadorCotizaciones(id: number, fechaDesde: string, esIndicadorDefault: boolean) {
    let params: HttpParams = new HttpParams()
      .set('IndicadorId', id.toString())
      .set('FechaDesde', fechaDesde)
      .set('EsIndicadorDefault', esIndicadorDefault.toString());

    var apiUrl = this.serviceUrl + 'GetCalculadorCotizaciones';

    return this.httpClient.get(apiUrl, { params: params });
  };
}
