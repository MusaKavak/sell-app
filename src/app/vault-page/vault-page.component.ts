import { Component, OnInit } from '@angular/core';
import { CheckItem } from '../models/checkItem';
import { VaultEntity } from '../models/vaultEntity';
import { VaultService } from '../services/vault.service';
import { getLongDate } from '../tools/dateTool';

@Component({
  selector: 'app-vault-page',
  templateUrl: './vault-page.component.html',
  styleUrls: ['./vault-page.component.css', './vault-page-sales-info.css', './vault-page-date.css'],
  providers: [VaultService]
})
export class VaultPageComponent implements OnInit {

  totalMoney: number = 0;
  totalCash: number = 0;
  totalOnCredit: number = 0;
  totalBuyMoney: number = 0;
  profit: number = 0

  currentDate: string = "";

  dayList: string[] = [];

  constructor(
    private vaultService: VaultService
  ) { }

  vaultEntityList: Array<VaultEntity> = [];

  ngOnInit(): void {
    var date = new Date();
    this.currentDate = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`
    this.getEntities(this.currentDate)
    this.setDayList()
  }

  getEntities(fileName: string) {
    this.vaultService.getVaultInfo(fileName).then((response) => {
      this.vaultEntityList = response.vaultEntityList;
      this.totalMoney = response.allMoney;

      this.totalCash = response.allMoneyWithoutCredits;
      this.totalOnCredit = response.allMoney - response.allMoneyWithoutCredits;

      this.totalBuyMoney = response.allBuyPrice
      this.profit = response.allMoney - response.allBuyPrice;
    })
  }

  deleteVaultItem(entity: VaultEntity) {
    this.vaultService.removeVaultEntity(entity, this.currentDate).then(() => {
      this.getEntities(this.currentDate)
    })
  }

  setDayList() {
    this.vaultService.getDayList().then((list) => {
      this.dayList = list.reverse();
    })
  }

  getDay(fileName: string) {
    this.currentDate = fileName
    this.getEntities(fileName)
  }

  _getLongDate(fileName: string = this.currentDate) {
    return getLongDate(fileName)
  }
}
