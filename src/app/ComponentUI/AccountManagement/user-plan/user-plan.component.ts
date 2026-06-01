// import { Component, OnInit } from '@angular/core';

// @Component({
//   selector: 'app-user-plan',
//   templateUrl: './user-plan.component.html',
//   styleUrls: ['./user-plan.component.css']
// })
// export class UserPlanComponent implements OnInit {

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
import { UserPlanUIComponent } from './user-plan-ui/user-plan-ui.component';

@Component({
  selector: 'app-user-plan',
  templateUrl: './user-plan.component.html',
  styleUrls: ['./user-plan.component.css']
})
export class UserPlanComponent implements OnInit {
  searchKey: string = '';
  placeHolder: string = 'Search';
  isLoading: boolean = false;
  displayedColumns: string[] = ['transNo', 'routes', 'description', 'created_by', 'updated_by', 'actions'];
  dataSource = new MatTableDataSource<any>([]);
  menus: any[] = [];
  pageSizeOptions: number[] = [7, 10, 25, 100];
  success: boolean = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('contextMenuTemplate') contextMenuTemplate!: TemplateRef<any>;

  overlayRef!: OverlayRef;
  contextMenuRow: any;
  selectedRow: any;

  constructor(
    private dialog: MatDialog,
    private menuServices: MenuService,
    private notificationsService: NotificationsService,
    private overlay: Overlay
  ) { }

  ngOnInit(): void {
    //this.getMenus();
  }

  async getMenus() {
    this.isLoading = true;
    try {
      this.dataSource.data = [];
      const res = await firstValueFrom(this.menuServices.getMenu());
      if (res.success) {
        // this.menus = res.data;
        // this.menus.sort((a, b) => a.transNo - b.transNo);
        // this.dataSource.data = this.menus;
        // this.dataSource.paginator = this.paginator;
        // this.dataSource.sort = this.sort;
      } else {
        this.notificationsService.toastrError(res.message);
      }
    } catch (err) {
      this.notificationsService.toastrError('Failed to load menus');
    } finally {
      this.isLoading = false;
    }
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

    const dialogRef = this.dialog.open(UserPlanUIComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
     // if (result) this.getMenus();
    });
  }

  edit(data: any): void {
    const dialogRef = this.dialog.open(UserPlanUIComponent, {
      width: '500px',
      data: data
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        //this.getMenus();
      }
    });
  }



  view(row: any) {
  }


  delete(row: any) {
    this.notificationsService.popupWarning(row.description, 'Are you sure to delete this menu?')
      .then(result => {
        if (result.value) {
          this.menuServices.deleteMenu(row.transNo).subscribe({
            next: res => {
              if (res.success) this.notificationsService.toastrSuccess(res.message);
              else this.notificationsService.toastrError(res.message);
            //  this.getMenus();
            },
            error: err => this.notificationsService.toastrError(err.error)
          });
        }
      });
    if (this.overlayRef) this.overlayRef.dispose();
  }
}
