import { Component, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { EventCategoryService } from '../../services/event-category.service';

@Component({
  selector: 'app-footer',
  imports: [RouterModule],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class Footer implements OnInit {
  private categoryService = inject(EventCategoryService);
  categories = this.categoryService.categoriesWithoutCount;

  ngOnInit(): void {
    this.categoryService.getCategoriesWithoutCount();
  }
}
