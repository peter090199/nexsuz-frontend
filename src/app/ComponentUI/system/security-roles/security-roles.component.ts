import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';

import { SecurityRolesService } from 'src/app/services/Security/security-roles.service';
import { SecurityRolesUIComponent } from 'src/app/ComponentSharedUI/system/security-roles-ui/security-roles-ui.component';

@Component({
  selector: 'app-security-roles',
  templateUrl: './security-roles.component.html',
  styleUrls: ['./security-roles.component.css']
})
export class SecurityRolesComponent implements OnInit {
  searchKey = '';
  placeHolder = 'Search security roles';

  /** Normal displayed columns */
  displayedColumns: string[] = [
    'id',
    'rolecode',
    'description',
    'created_by',
    'updated_by',
    'actions'
  ];

  /** Group header row – merges id + rolecode under "Basic Info" */
  groupHeaderColumns: string[] = [
    'groupHeader',   // covers id + rolecode
    'description',
    'created_by',
    'updated_by',
    'actions'
  ];

  dataSource = new MatTableDataSource<any>([]);
  csecurityroles: any[] = [];
  isLoading = false;
  pageSizeOptions = [5, 10, 25, 100];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private securityRoleService: SecurityRolesService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.fetchSecurityRoles();
  }

  async fetchSecurityRoles(): Promise<void> {
    this.isLoading = true;
    try {
      const response = await firstValueFrom(this.securityRoleService.getSecurityRoles());
      if (response.success) {
        this.csecurityroles = response.message;
        this.dataSource.data = this.csecurityroles;
      }
    } catch (error) {
      console.error('Error fetching security roles:', error);
    } finally {
      this.isLoading = false;
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
  }

  applyFilter(): void {
    this.dataSource.filter = this.searchKey.trim().toLowerCase();
  }

  clearSearch(): void {
    this.searchKey = '';
    this.applyFilter();
  }

  edit(element: any): void {
    const dialogRef = this.dialog.open(SecurityRolesUIComponent, {
      width: '800px',
      data: element
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.fetchSecurityRoles();
    });
  }
}
