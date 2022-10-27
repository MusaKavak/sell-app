import { Component, OnInit } from '@angular/core';
import { VaultEntity } from 'src/app/models/VaultEntity';
import { getLongDate, getVaultFileName, getVaultPathDesign } from 'src/app/tools/dateTool';
import { VaultPageViewModel } from './vault-page.viewmodel';
@Component({
  selector: 'app-vault-page',
  templateUrl: './vault-page.component.html',
  styleUrls: ['./vault-page-entities-table.css', './vault-page-sales-info-container.css', './vault-page-date.css'],
})
export class VaultPageComponent implements OnInit {
  viewmodel: VaultPageViewModel | null = null

  //Variables
  totalMoney: number = 0;
  totalCash: number = 0;
  totalOnCredit: number = 0;
  totalBuyMoney: number = 0;
  profit: number = 0

  //Lists
  availableDays: string[] = [];
  vaultEntities: Array<VaultEntity> = [];

  currentFileName: string = ""

  ngOnInit(): void {
    this.viewmodel = new VaultPageViewModel()
    this.currentFileName = getVaultFileName(new Date())
    this.setLists()
  }

  async setLists() {
    if (this.viewmodel != null) {
      this.availableDays = await this.viewmodel?.getAvailableDays()
      this.loadVaultEntities(this.currentFileName)
    }
  }

  loadVaultEntities(fileName: string) {
    this.viewmodel?.getVaultEntitiesByDayName(fileName).then((response) => {
      this.vaultEntities = response.vaultEntities.reverse();
      this.totalMoney = response.totalSellPrice;
      this.totalCash = response.totalValueOfCashSales;
      this.totalOnCredit = response.totalValueOfCreditSales;
      this.totalBuyMoney = response.totalBuyPrice
      this.profit = response.totalSellPrice - response.totalBuyPrice;
    })
  }

  deleteVaultItem(entity: VaultEntity) {
    this.viewmodel?.removeVaultEntity(entity, this.currentFileName).then(() => {
      this.loadVaultEntities(this.currentFileName)
    })
  }

  loadDay(fileName: string, dateElement: HTMLElement) {
    this.currentFileName = fileName
    document.querySelector("#day.active")?.classList.remove("active")
    dateElement.classList.add("active")
    this.loadVaultEntities(fileName)
  }

  getLongDate(fileName: string = this.currentFileName) {
    return getLongDate(fileName)
  }

  expandItem(element: HTMLElement) {
    if (element.classList.contains("active")) {
      element.classList.remove("active");
    } else {
      element.classList.add("active");
    }
  }

  setDateContainerScroll() {

  }
}
