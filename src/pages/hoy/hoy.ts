import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { IndicadoresData } from '../../providers/indicadores-data';
import * as _ from 'lodash'
import moment, { Moment } from 'moment';
import { Loading, LoadingController } from 'ionic-angular';

@Component({
    selector: 'page-hoy',
    templateUrl: 'hoy.html'
})
export class HoyPage {
    public indicadores: Array<any> = [];

    public fechaCotizacion: string = moment().startOf('day').toDate().toISOString();

    public mode: string = "";

    constructor(public loadingCtrl: LoadingController, public navCtrl: NavController, public indicadoresDataProvider: IndicadoresData) {

    };

    presentLoading(): Loading {
        const loader = this.loadingCtrl.create({
            content: "Consultando indicadores..."
        });
        loader.present();

        return loader;
    };

    cancelLoading(item: Loading) {
        item.dismiss();
    };

    formatMomentDate(item: moment.Moment): string {
        return item.format('DD/MM/YYYY');
    };

    formatDate(item: string): string {
        return this.formatMomentDate(moment(item));
    };

    getCotizaciones(indicadores: any[], fecha: Moment): void {
        var i = _.map(indicadores, function (i: any) {
            return i.id;
        });

        this.indicadoresDataProvider.getMultiIndicadorCotizaciones(i.join(), fecha.format("MM/DD/YYYY")).subscribe((cotizacionesData: any) => {
            var cotizaciones = _.map(cotizacionesData.cotizaciones, function (c) {
                return {
                    indicadorId: c.indicadorId,
                    fechaHoraCotizacion: c.fechaHoraCotizacion,
                    valorCotizacion: c.valorCotizacion
                };
            });

            _.each(cotizaciones, function (c) {
                var ind = _.filter(indicadores, function (i) {
                    return i.id == c.indicadorId
                });

                if (!_.isEmpty(ind)) {
                    _.first(ind).valorCotizacion = c.valorCotizacion;
                }
            });
        });
    };

    ionViewDidLoad() {

        var dataProvider = this.indicadoresDataProvider;
        this.mode = dataProvider.mode;

        var loadingItem = this.presentLoading();

        dataProvider.getIndicadores().subscribe((indicadoresData: any) => {

            for (var i = 0; i < indicadoresData.items.length; i++) {
                this.indicadores.push(indicadoresData.items[i]);
            }

            this.getCotizaciones(this.indicadores, moment(this.fechaCotizacion));

            this.cancelLoading(loadingItem);
        });
    };
}
