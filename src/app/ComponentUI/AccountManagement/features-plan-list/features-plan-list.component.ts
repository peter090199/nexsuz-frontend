// import { Component, OnInit } from '@angular/core';

// @Component({
//   selector: 'app-features-plan-list',
//   templateUrl: './features-plan-list.component.html',
//   styleUrls: ['./features-plan-list.component.css']
// })
// export class FeaturesPlanListComponent implements OnInit {

//   constructor() { }

//   ngOnInit(): void {
//   }

// }
import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { MenuService } from 'src/app/services/MasterAdmin/menu.service';
import { NotificationsService } from 'src/app/services/Global/notifications.service';
import { firstValueFrom } from 'rxjs';

import { MenuUIComponent } from 'src/app/ComponentSharedUI/system/menu-ui/menu-ui.component';

import { UserPlanService } from 'src/app/services/AccountPlan/user-plan.service';
import { FeaturesPlanUIComponent } from '../user-plan/features-plan-ui/features-plan-ui.component';
import { FeaturesPlanListUIComponent } from '../features-plan-list-ui/features-plan-list-ui.component';
import { FeaturesPlanUI2Component } from '../user-plan/features-plan-ui2/features-plan-ui2.component';

@Component({
  selector: 'app-features-plan-list',
  templateUrl: './features-plan-list.component.html',
  styleUrls: ['./features-plan-list.component.css']
})
export class FeaturesPlanListComponent implements OnInit {
  searchKey: string = '';
  placeHolder: string = 'Search';
  isLoading: boolean = false;
  displayedColumns: any[] = [
    'planId',
    'sort_number',
    'plan_name',
    'price',
    'tag',
    'recordStatus',
    'actions'
  ];


  dataSource = new MatTableDataSource<any>([]);
  menus: any[] = [];
  pageSizeOptions: number[] = [5, 10, 25, 100];
  success: boolean = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('contextMenuTemplate') contextMenuTemplate!: TemplateRef<any>;

  overlayRef!: OverlayRef;
  contextMenuRow: any;
  selectedRow: any;

  constructor(
    private dialog: MatDialog,
    private notificationsService: NotificationsService,
    private overlay: Overlay,
    private userPlanService: UserPlanService
  ) { }

  ngOnInit(): void {
    this.getPlans();
  }


  async getPlans() {
    this.isLoading = true;

    this.userPlanService.getAll().subscribe({
      next: (res) => {
        if (res.success) {
          this.dataSource.data = res.data;
          this.menus = res.data;
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.notificationsService.toastrError('Failed to load plans');
      }
    });
  }


  applyFilter() {
    this.dataSource.filter = this.searchKey.trim().toLowerCase();
  }

  clearSearch() {
    this.searchKey = '';
    this.applyFilter();
  }

  onRowClick(row: any) {
    this.selectedRow = row;
  }

  openContextMenu(event: MouseEvent, row: any) {
    event.preventDefault();
    this.contextMenuRow = row;

    if (this.overlayRef) this.overlayRef.dispose();

    const positionStrategy = this.overlay.position()
      .flexibleConnectedTo({ x: event.clientX, y: event.clientY })
      .withPositions([{ originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'top' }]);

    this.overlayRef = this.overlay.create({ positionStrategy, hasBackdrop: true });
    this.overlayRef.attach(new TemplatePortal(this.contextMenuTemplate, null!));
    this.overlayRef.backdropClick().subscribe(() => this.overlayRef.dispose());
  }

  onClickSubModule() {
    // if (!this.selectedRow) {
    //   this.notificationsService.toastrWarning('Please Select a Menu.');
    //   return;
    // }

    // const dialogConfig = new MatDialogConfig();
    // dialogConfig.width = '600px';
    // dialogConfig.disableClose = true;
    // dialogConfig.autoFocus = true;
    // dialogConfig.data = { selectedRow: this.selectedRow };

    // const dialogRef = this.dialog.open(SubmenuComponent, dialogConfig);
    // dialogRef.afterClosed().subscribe(result => {
    //   if (result) this.getMenus();
    //   this.selectedRow = null;
    // });
  }

  onClickNew() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '500px';
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;

    // const dialogRef = this.dialog.open(UserPlanUIComponent, dialogConfig);
    // dialogRef.afterClosed().subscribe(result => {
    //   if (result) this.getPlans();
    // });
  }

  edit(row: any): void {
    // const dialogRef = this.dialog.open(UserPlanUIComponent, {
    //   width: '500px',
    //   disableClose: true,
    //   data: row
    // });

    // dialogRef.afterClosed().subscribe(result => {
    //   if (result) {
    //     this.getPlans();
    //   }
    // });

  }



  
  view(row: any): void {
    const dialogRef = this.dialog.open(FeaturesPlanUI2Component, {
      width: '1000px',
      disableClose: true,
      data: row
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getPlans();
      }
    });

  }



  delete(row: any) {
    this.notificationsService
      .popupWarning(row.plan_name, 'Delete this plan?')
      .then(result => {

        if (result.value) {

          this.userPlanService.delete(row.id)
            .subscribe({
              next: (res) => {

                if (res.success) {
                  this.notificationsService.toastrSuccess(res.message);
                  this.getPlans();
                } else {
                  this.notificationsService.toastrError(res.message);
                }
              }
            });
        }
      });
  }


}
