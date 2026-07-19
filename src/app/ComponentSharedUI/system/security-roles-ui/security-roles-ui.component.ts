import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { SecurityRolesService } from 'src/app/services/Security/security-roles.service';
import { NotificationsService } from 'src/app/services/Global/notifications.service';

interface SubmenuLine { submenus_id: any; checked: boolean; }
interface SelectedMenu { rolecode: string; menus_id: any; checked: boolean; lines: SubmenuLine[]; }

@Component({
  selector: 'app-security-roles-ui',
  templateUrl: './security-roles-ui.component.html',
  styleUrls: ['./security-roles-ui.component.scss']
})
export class SecurityRolesUIComponent implements OnInit {
  role_code!: string;
  securityRoles: any[] = [];
  selectedMenus: SelectedMenu[] = [];
  loading = false;
  error: string | null = null;

  constructor(
    private securityService: SecurityRolesService,
    private notify: NotificationsService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.role_code = data?.rolecode ?? '';
  }

  ngOnInit(): void {
    this.getSecurityRoles(this.role_code);
  }

  getSecurityRoles(rolecode: string): void {
    this.loading = true;
    this.error = null;
    this.securityService.getSecurityRolesByDesc_Code(rolecode).subscribe({
      next: (res: any[]) => { this.securityRoles = res; this.loading = false; },
      error: () => { this.error = 'Failed to load security roles'; this.loading = false; }
    });
  }

  private getOrCreateParent(menu: any): SelectedMenu {
    let parent = this.selectedMenus.find(m => m.menus_id === menu.menus_id);
    if (!parent) {
      parent = { rolecode: this.role_code, menus_id: menu.menus_id, checked: false, lines: [] };
      this.selectedMenus.push(parent);
    }
    return parent;
  }

  onMenuChange(menu: any, event: MatCheckboxChange): void {
    menu.access = event.checked;
    const parent = this.getOrCreateParent(menu);
    parent.checked = event.checked;
    if (!event.checked) parent.lines = [];
  }

  onSubmenuChange(menu: any, sub: any, event: MatCheckboxChange): void {
    sub.access = event.checked;
    const parent = this.getOrCreateParent(menu);
    const existingSub = parent.lines.find(l => l.submenus_id === sub.submenus_id);

    if (existingSub) existingSub.checked = event.checked;
    else parent.lines.push({ submenus_id: sub.submenus_id, checked: event.checked });

    // keep the menu checkbox in sync whenever any submenu is checked
    const anyChecked = parent.lines.some(l => l.checked);
    parent.checked = anyChecked || parent.checked;
    menu.access = parent.checked;

    if (!anyChecked && !menu.access) {
      this.selectedMenus = this.selectedMenus.filter(m => m.menus_id !== menu.menus_id);
    }
  }

  selectedCount(section: any): number {
    return (section.datas ?? []).filter((m: any) => m.access).length;
  }

  submitData(): void {
    if (!this.selectedMenus.length) {
      this.notify.toastrError('Please select at least one menu');
      return;
    }

    const payload = {
      header: this.selectedMenus.map(menu => ({
        rolecode: this.role_code,
        menus_id: menu.menus_id,
        checked: !!menu.checked,
        lines: menu.lines.map(sub => ({ submenus_id: sub.submenus_id, checked: !!sub.checked }))
      }))
    };

    this.loading = true;
    this.securityService.saveAccessMenu(payload).subscribe({
      next: (res: any) => {
        this.loading = false;
        res?.success
          ? this.notify.toastrSuccess(res.message || 'Saved successfully')
          : this.notify.toastrError(res?.message || 'Save failed');
      },
      error: () => { this.loading = false; this.notify.toastrError('Submission failed'); }
    });
  }
}