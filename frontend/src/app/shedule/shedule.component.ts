import { CommonModule } from '@angular/common';
import { Component, OnInit, ElementRef, HostListener } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-schedule',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './shedule.component.html',
  styleUrl: './shedule.component.css'
})
export class SheduleComponent implements OnInit {
  employees: any[] = [];
  hours: string[] = [
    '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00'
  ];
  days: string[] = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
  dayNumbers: { [key: string]: number } = {};
  months: string[] = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
  currentDate: Date = new Date();
  viewMode: 'week' | 'month' = 'week';
  draggingEvent: any = null;
  dragOrigin: { employeeIndex: number, day: string, hour: string } | null = null;
  
  // Pour les filtres semaine et mois
  weekCalendarVisible: boolean = false;
  monthCalendarVisible: boolean = false;
  selectedWeekDay: number = new Date().getDate();
  selectedMonth: number = new Date().getMonth();
  selectedYear: number = new Date().getFullYear();
  weekRange: { start: Date, end: Date } | null = null;
  
  // Pour la création et modification d'événements
  modalVisible: boolean = false;
  modalInput: string = '';
  modalTarget: { employee: any, day: string, hour: string } | null = null;
  
  // Pour l'affichage des détails d'un événement
  eventDetailsVisible: boolean = false;
  selectedEvent: any = null;
  selectedEmployee: any = null;
  editMode: boolean = false;
  
  // Pour le drag and drop
  dragOffsetX: number = 0;
  dragOffsetY: number = 0;
  shadowElement: HTMLElement | null = null;
  
  // Pour la vue mensuelle
  calendarDays: any[] = [];

  constructor(private elementRef: ElementRef) {}

  ngOnInit() {
    fetch('assets/schedule-data.json')
      .then(res => res.json())
      .then(data => {
        this.employees = data.employees;
        this.generateCalendarData();
        this.calculateWeekRange(this.currentDate);
      });
  }

  /**
   * Génère les données de calendrier pour la semaine et le mois
   */
  generateCalendarData() {
    // Générer les numéros de jours pour la vue semaine
    this.generateDayNumbers();
    
    // Générer les jours du mois pour la vue mensuelle
    this.generateMonthDays();
  }

  /**
   * Calcule la plage de jours ouvrables de la semaine (lundi à vendredi)
   * en fonction de la date sélectionnée
   */
  calculateWeekRange(date: Date) {
    const currentDate = new Date(date);
    const dayOfWeek = currentDate.getDay(); // 0 = Dimanche, 1 = Lundi, ...
    
    // Trouver le lundi de la semaine
    let startDate = new Date(currentDate);
    if (dayOfWeek === 0) { // Dimanche
      startDate.setDate(currentDate.getDate() - 6);
    } else {
      startDate.setDate(currentDate.getDate() - (dayOfWeek - 1));
    }
    
    // Trouver le vendredi de la semaine
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 4); // +4 jours pour vendredi
    
    this.weekRange = { start: startDate, end: endDate };
    this.currentDate = new Date(startDate);
    this.generateCalendarData();
  }

  /**
   * Affiche ou masque le calendrier de sélection de semaine
   */
  toggleWeekCalendar() {
    this.weekCalendarVisible = !this.weekCalendarVisible;
    this.monthCalendarVisible = false;
  }

  /**
   * Affiche ou masque le calendrier de sélection de mois
   */
  toggleMonthCalendar() {
    this.monthCalendarVisible = !this.monthCalendarVisible;
    this.weekCalendarVisible = false;
  }

  /**
   * Sélectionne un jour du calendrier pour la vue semaine
   */
  selectWeekDay(day: number) {
    this.selectedWeekDay = day;
    const newDate = new Date(this.selectedYear, this.selectedMonth, day);
    this.calculateWeekRange(newDate);
    this.weekCalendarVisible = false;
  }

  /**
   * Sélectionne un mois pour la vue mensuelle
   */
  selectMonth(month: number) {
    this.selectedMonth = month;
    this.currentDate = new Date(this.selectedYear, month, 1);
    this.generateCalendarData();
    this.monthCalendarVisible = false;
  }

  /**
   * Génère un tableau des jours du mois actuel avec leurs numéros
   */
  generateDayNumbers() {
    // Réinitialiser
    this.dayNumbers = {};
    
    const today = new Date(this.currentDate);
    const dayOfWeek = today.getDay(); // 0 = Dimanche, 1 = Lundi, ...
    
    // Reculer jusqu'au début de la semaine (lundi)
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - ((dayOfWeek === 0 ? 7 : dayOfWeek) - 1));
    
    // Créer un mapping des jours et de leurs numéros
    for (let i = 0; i < 7; i++) {
      const currentDay = new Date(startOfWeek);
      currentDay.setDate(startOfWeek.getDate() + i);
      
      // Convertir le jour de la semaine en nom français
      const dayName = this.days[i];
      this.dayNumbers[dayName] = currentDay.getDate();
    }
  }

  /**
   * Génère un tableau des jours du mois pour la vue mensuelle
   */
  generateMonthDays() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    
    // Premier jour du mois
    const firstDay = new Date(year, month, 1);
    // Dernier jour du mois
    const lastDay = new Date(year, month + 1, 0);
    
    const daysInMonth = lastDay.getDate();
    
    // Déterminer le jour de la semaine du premier jour (0 = Dimanche, 1 = Lundi, ...)
    let firstDayOfWeek = firstDay.getDay();
    if (firstDayOfWeek === 0) firstDayOfWeek = 7; // Convertir dimanche (0) en 7
    
    // Initialiser le tableau des jours
    this.calendarDays = [];
    
    // Ajouter des jours vides pour le début du mois
    for (let i = 1; i < firstDayOfWeek; i++) {
      this.calendarDays.push({ day: 0, date: null });
    }
    
    // Ajouter les jours du mois
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      this.calendarDays.push({ 
        day, 
        date,
        dayOfWeek: date.getDay() === 0 ? 6 : date.getDay() - 1 // 0 = Lundi, 1 = Mardi, ...
      });
    }
    
    // Compléter la dernière semaine avec des jours vides
    const remainingCells = 7 - (this.calendarDays.length % 7);
    if (remainingCells < 7) {
      for (let i = 0; i < remainingCells; i++) {
        this.calendarDays.push({ day: 0, date: null });
      }
    }
  }

  /**
   * Récupère les événements pour un jour spécifique du mois
   */
  getMonthDayEvents(employee: any, day: number): any[] {
    if (!employee || !employee.events || day === 0) return [];
    
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const date = new Date(year, month, day);
    
    // Convertir la date en jour de la semaine au format français
    const daysOfWeek = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const dayName = daysOfWeek[date.getDay()];
    
    // Filtrer les événements pour ce jour
    return employee.events.filter((event: any) => {
      return event.day === dayName;
    });
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (this.draggingEvent && this.shadowElement) {
      event.preventDefault();
      this.shadowElement.style.left = `${event.clientX - this.dragOffsetX}px`;
      this.shadowElement.style.top = `${event.clientY - this.dragOffsetY}px`;
      
      // Détecter la cellule sous le curseur
      const elemBelow = document.elementFromPoint(event.clientX, event.clientY);
      const cell = elemBelow?.closest('.schedule-cell, .month-cell');
      
      if (cell) {
        // Trouver toutes les cellules
        const allCells = document.querySelectorAll('.schedule-cell, .month-cell');
        // Réinitialiser les surlignages
        allCells.forEach(c => c.classList.remove('cell-highlight'));
        // Surligner la cellule actuelle
        cell.classList.add('cell-highlight');
      }
    }
  }

  @HostListener('document:mouseup', ['$event'])
  onMouseUp(event: MouseEvent) {
    if (this.draggingEvent) {
      // Trouver la cellule sous le curseur
      const elemBelow = document.elementFromPoint(event.clientX, event.clientY);
      const cell = elemBelow?.closest('.schedule-cell, .month-cell');
      
      if (cell) {
        // Récupérer les infos de la cellule à partir de ses attributs data
        const empId = cell.getAttribute('data-employee-id');
        const day = cell.getAttribute('data-day');
        const hour = cell.getAttribute('data-hour');
        
        if (empId && day && hour) {
          const employee = this.employees.find(e => e.id.toString() === empId);
          if (employee) {
            this.completeEventMove(employee, day, hour);
          }
        }
      }
    }

    // Nettoyer les cellules surlignées
    document.querySelectorAll('.cell-highlight').forEach(cell => {
      cell.classList.remove('cell-highlight');
    });

    if (this.shadowElement) {
      document.body.removeChild(this.shadowElement);
      this.shadowElement = null;
    }

    this.draggingEvent = null;
    this.dragOrigin = null;
  }

  getEmployeeDays(employee: any) {
    return employee.workDays;
  }

  getEvent(employee: any, day: string, hour: string) {
    return employee && employee.events && employee.events.find((e: any) => e.day === day && e.hour === hour);
  }

  getEventStyle(employee: any, day: string, hour: string) {
    const dragState = this.draggingEvent && 
                      this.dragOrigin &&
                      this.dragOrigin.employeeIndex === this.employees.indexOf(employee) &&
                      this.dragOrigin.day === day && 
                      this.dragOrigin.hour === hour;
    
    return {
      cursor: dragState ? 'grabbing' : 'grab',
      background: '#007bff',
      color: '#fff',
      borderRadius: '4px',
      padding: '2px 8px',
      userSelect: 'none',
      opacity: dragState ? '0.5' : '1'
    };
  }

  getMonthEventStyle() {
    return {
      background: '#007bff',
      color: '#fff',
      borderRadius: '4px',
      padding: '2px 4px',
      userSelect: 'none',
      cursor: 'pointer'
    };
  }

  startDrag(employee: any, day: string, hour: string, mouseEvent: MouseEvent) {
    // Vérifier que c'est un vrai début de drag (pas un simple clic)
    // On utilisera mousedown + mousemove pour détecter un vrai drag
    mouseEvent.preventDefault();
    mouseEvent.stopPropagation();
    
    // Déclarer la variable pour la position initiale
    const startX = mouseEvent.clientX;
    const startY = mouseEvent.clientY;
    
    const event = this.getEvent(employee, day, hour);
    if (!event) return;
    
    // Création d'un listener temporaire pour détecter le début réel du drag
    const mouseMoveHandler = (moveEvent: MouseEvent) => {
      // Calculer la distance depuis le point de départ
      const distance = Math.sqrt(
        Math.pow(moveEvent.clientX - startX, 2) + 
        Math.pow(moveEvent.clientY - startY, 2)
      );
      
      // Si l'utilisateur a déplacé la souris d'une distance significative, c'est un drag
      if (distance > 5) {
        // Commencer le vrai drag
        this.initiateDrag(employee, day, hour, moveEvent);
        
        // Retirer les écouteurs temporaires
        document.removeEventListener('mousemove', mouseMoveHandler);
        document.removeEventListener('mouseup', mouseUpHandler);
      }
    };
    
    // Listener pour annuler si l'utilisateur relâche la souris sans bouger
    const mouseUpHandler = () => {
      document.removeEventListener('mousemove', mouseMoveHandler);
      document.removeEventListener('mouseup', mouseUpHandler);
    };
    
    // Ajouter les écouteurs temporaires
    document.addEventListener('mousemove', mouseMoveHandler);
    document.addEventListener('mouseup', mouseUpHandler);
  }
  
  // Méthode qui gère le véritable début du drag
  initiateDrag(employee: any, day: string, hour: string, mouseEvent: MouseEvent) {
    const event = this.getEvent(employee, day, hour);
    if (!event) return;
    
    const employeeIndex = this.employees.indexOf(employee);
    this.draggingEvent = { ...event };
    this.dragOrigin = { employeeIndex, day, hour };
    
    // Create shadow element
    const element = mouseEvent.currentTarget as HTMLElement || document.querySelector(`.event[data-day="${day}"][data-hour="${hour}"]`);
    
    if (!element) return;
    
    const rect = element.getBoundingClientRect();
    
    this.dragOffsetX = mouseEvent.clientX - rect.left;
    this.dragOffsetY = mouseEvent.clientY - rect.top;
    
    this.shadowElement = document.createElement('div');
    this.shadowElement.innerHTML = event.title;
    this.shadowElement.style.position = 'fixed';
    this.shadowElement.style.left = `${mouseEvent.clientX - this.dragOffsetX}px`;
    this.shadowElement.style.top = `${mouseEvent.clientY - this.dragOffsetY}px`;
    this.shadowElement.style.background = '#007bff';
    this.shadowElement.style.color = '#fff';
    this.shadowElement.style.padding = '4px 10px';
    this.shadowElement.style.borderRadius = '4px';
    this.shadowElement.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
    this.shadowElement.style.pointerEvents = 'none';
    this.shadowElement.style.zIndex = '1000';
    this.shadowElement.style.width = `${rect.width}px`;
    this.shadowElement.style.transition = 'none';
    
    document.body.appendChild(this.shadowElement);
  }

  onDragOver(employee: any, day: string, hour: string, event: MouseEvent) {
    if (this.draggingEvent) {
      event.preventDefault();
    }
  }

  onDrop(employee: any, day: string, hour: string, event: MouseEvent) {
    event.preventDefault();
    if (this.draggingEvent && this.dragOrigin) {
      this.completeEventMove(employee, day, hour);
    }
  }

  completeEventMove(employee: any, day: string, hour: string) {
    if (!this.draggingEvent || !this.dragOrigin) return;

    const originEmpIndex = this.dragOrigin.employeeIndex;
    const originEmp = this.employees[originEmpIndex];

    const eventIndex = originEmp.events.findIndex(
      (e: any) => e.day === this.dragOrigin?.day && e.hour === this.dragOrigin?.hour
    );

    if (eventIndex === -1) return;

    // Clone arrays deeply to avoid reference issues
    const updatedEmployees = JSON.parse(JSON.stringify(this.employees));

    // Remove from original position
    updatedEmployees[originEmpIndex].events.splice(eventIndex, 1);

    // Add to new position if cell is empty
    const targetEmpIndex = this.employees.indexOf(employee);
    const targetEvent = this.getEvent(employee, day, hour);
    
    if (!targetEvent) {
      updatedEmployees[targetEmpIndex].events.push({
        ...this.draggingEvent,
        day,
        hour,
      });
    }

    this.employees = updatedEmployees;
    
    // Mettre à jour le calendrier
    this.generateCalendarData();
  }

  onCellClick(employee: any, day: string, hour: string) {
    const event = this.getEvent(employee, day, hour);
    
    if (event) {
      // Si un événement existe, ça sera géré par le handler (click) sur l'événement
      // Pas besoin de faire quoi que ce soit ici pour éviter les conflits
      return;
    } else {
      // Si pas d'événement, ouvrir le modal pour en créer un
      this.modalVisible = true;
      this.modalInput = '';
      this.modalTarget = { employee, day, hour };
    }
  }

  onMonthCellClick(employee: any, day: number) {
    if (day === 0) return; // Jour vide
    
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const date = new Date(year, month, day);
    
    // Convertir la date en jour de la semaine au format français
    const daysOfWeek = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const dayName = daysOfWeek[date.getDay()];
    
    // Vérifier s'il y a des événements pour ce jour
    const events = this.getMonthDayEvents(employee, day);
    
    if (events.length > 0) {
      // Afficher le premier événement (on pourrait aussi afficher une liste)
      this.showEventDetails(events[0], employee);
    } else {
      // Créer un nouvel événement à 08:00 par défaut
      this.modalVisible = true;
      this.modalInput = '';
      this.modalTarget = { employee, day: dayName, hour: '08:00' };
    }
  }

  showEventDetails(event: any, employee: any) {
    this.selectedEvent = { 
      ...event,
      originalDay: event.day,
      originalHour: event.hour 
    };
    this.selectedEmployee = employee;
    this.eventDetailsVisible = true;
    this.editMode = false;
  }

  closeEventDetails() {
    this.eventDetailsVisible = false;
    this.selectedEvent = null;
    this.selectedEmployee = null;
    this.editMode = false;
  }

  toggleEditMode() {
    this.editMode = !this.editMode;
  }

  updateEvent() {
    if (!this.selectedEvent || !this.selectedEmployee) return;
    
    const empIndex = this.employees.indexOf(this.selectedEmployee);
    if (empIndex === -1) return;
    
    // Trouver l'événement original
    const eventIndex = this.employees[empIndex].events.findIndex(
      (e: any) => e.day === this.selectedEvent.originalDay && e.hour === this.selectedEvent.originalHour
    );
    
    if (eventIndex === -1) return;
    
    // Clone arrays deeply to avoid reference issues
    const updatedEmployees = JSON.parse(JSON.stringify(this.employees));
    
    // Mettre à jour l'événement
    updatedEmployees[empIndex].events[eventIndex] = {
      day: this.selectedEvent.day,
      hour: this.selectedEvent.hour,
      title: this.selectedEvent.title
    };
    
    this.employees = updatedEmployees;
    this.closeEventDetails();
    
    // Mettre à jour le calendrier
    this.generateCalendarData();
  }

  deleteEvent() {
    if (!this.selectedEvent || !this.selectedEmployee) return;
    
    const empIndex = this.employees.indexOf(this.selectedEmployee);
    if (empIndex === -1) return;
    
    // Trouver l'événement original
    const eventIndex = this.employees[empIndex].events.findIndex(
      (e: any) => e.day === this.selectedEvent.day && e.hour === this.selectedEvent.hour
    );
    
    if (eventIndex === -1) return;
    
    // Clone arrays deeply to avoid reference issues
    const updatedEmployees = JSON.parse(JSON.stringify(this.employees));
    
    // Supprimer l'événement
    updatedEmployees[empIndex].events.splice(eventIndex, 1);
    
    this.employees = updatedEmployees;
    this.closeEventDetails();
    
    // Mettre à jour le calendrier
    this.generateCalendarData();
  }

  closeModal() {
    this.modalVisible = false;
    this.modalInput = '';
    this.modalTarget = null;
  }

  submitModal() {
    if (this.modalTarget && this.modalInput.trim()) {
      const { employee, day, hour } = this.modalTarget;
      const empIndex = this.employees.indexOf(employee);
      
      // Create deep copy to ensure reactivity
      const updatedEmployees = JSON.parse(JSON.stringify(this.employees));
      
      if (!updatedEmployees[empIndex].events) {
        updatedEmployees[empIndex].events = [];
      }
      
      updatedEmployees[empIndex].events.push({ 
        day, 
        hour, 
        title: this.modalInput 
      });
      
      this.employees = updatedEmployees;
      this.closeModal();
      
      // Mettre à jour le calendrier
      this.generateCalendarData();
    }
  }

  switchView(mode: 'week' | 'month') {
    this.viewMode = mode;
    this.generateCalendarData();
  }

  goToPrevious() {
    if (this.viewMode === 'week') {
      this.currentDate.setDate(this.currentDate.getDate() - 7);
    } else {
      this.currentDate.setMonth(this.currentDate.getMonth() - 1);
    }
    this.currentDate = new Date(this.currentDate);
    this.generateCalendarData();
  }

  goToNext() {
    if (this.viewMode === 'week') {
      this.currentDate.setDate(this.currentDate.getDate() + 7);
    } else {
      this.currentDate.setMonth(this.currentDate.getMonth() + 1);
    }
    this.currentDate = new Date(this.currentDate);
    this.generateCalendarData();
  }

  goToToday() {
    this.currentDate = new Date();
    this.generateCalendarData();
  }

  getFormattedDate(): string {
    const options: Intl.DateTimeFormatOptions = {
      month: 'long',
      year: 'numeric'
    };
    
    if (this.viewMode === 'week') {
      const startOfWeek = new Date(this.currentDate);
      const endOfWeek = new Date(this.currentDate);
      startOfWeek.setDate(this.currentDate.getDate() - this.currentDate.getDay() + 1);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      
      return `${startOfWeek.getDate()} - ${endOfWeek.getDate()} ${this.months[startOfWeek.getMonth()]} ${startOfWeek.getFullYear()}`;
    } else {
      return `${this.months[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
    }
  }

  getFormattedEventDate(day: string): string {
    // Trouver le numéro de jour correspondant
    const dayNumber = this.dayNumbers[day] || '?';
    
    const month = this.currentDate.getMonth() + 1; // Les mois commencent à 0
    const year = this.currentDate.getFullYear();
    
    return `${day} ${dayNumber}, ${year}`;
  }
}
