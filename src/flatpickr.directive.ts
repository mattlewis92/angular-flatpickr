import {
  Directive,
  ElementRef,
  AfterViewInit,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  OnDestroy,
  forwardRef,
  HostListener,
  Renderer2
} from '@angular/core';
import {
  FlatpickrDefaults,
  DisableEnableDate,
  FlatpickrDefaultsInterface
} from './flatpickr-defaults.service';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import flatpickr from 'flatpickr';

export interface FlatPickrOutputOptions {
  selectedDates: Date[];
  dateString: string;
  instance: any;
}

export interface FlatPickrDayCreateOutputOptions
  extends FlatPickrOutputOptions {
  dayElement: HTMLElement;
}

export const FLATPICKR_CONTROL_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => FlatpickrDirective), //tslint:disable-line
  multi: true
};

@Directive({
  selector: '[mwlFlatpickr]',
  providers: [FLATPICKR_CONTROL_VALUE_ACCESSOR],
  host: {
    // tslint:disable-line use-host-property-decorator
    '(blur)': 'onTouchedFn()'
  },
  exportAs: 'mwlFlatpickr'
})
export class FlatpickrDirective
  implements AfterViewInit, OnChanges, OnDestroy, ControlValueAccessor {
  /**
   * Object-options that can be user for multiple instances of Flatpickr.
   * Option from this object is applied only if specific option is not specified.
   * Example:
   * ```typescript
   * options: FlatpickrDefaultsInterface = {
   *      altFormat: 'd/m/Y',   // will be ignored since altFormat is provided via specific attribute
   *      altInput: true        // will be used since specific attribute is not provided
   * };
   * ```
   * ```html
   * <input
   *   class="form-control"
   *   type="text"
   *   mwlFlatpickr
   *   [options]="options"
   *   altFormat="d/m/Y">
   * ```
   */
  @Input() options: FlatpickrDefaultsInterface = {};

  /**
   * Exactly the same as date format, but for the altInput field.
   */
  @Input() altFormat: string;

  /**
   * 	Show the user a readable date (as per altFormat), but return something totally different to the server.
   */
  @Input() altInput: boolean;

  /**
   * This class will be added to the input element created by the altInput option.
   * Note that `altInput` already inherits classes from the original input.
   */
  @Input() altInputClass: string;

  /**
   * Allows the user to enter a date directly input the input field. By default, direct entry is disabled.
   */
  @Input() allowInput: boolean;

  /**
   * Instead of `body`, appends the calendar to the specified node instead.
   */
  @Input() appendTo: HTMLElement;

  /**
   * Defines how the date will be formatted in the aria-label for calendar days, using the same tokens as dateFormat. If you change this, you should choose a value that will make sense if a screen reader reads it out loud.
   */
  @Input() ariaDateFormat?: string;

  /**
   * Whether clicking on the input should open the picker.
   * You could disable this if you wish to open the calendar manually `with.open()`.
   */
  @Input() clickOpens: boolean;

  /**
   * A string of characters which are used to define how the date will be displayed in the input box.
   * The supported characters are defined in the table below.
   */
  @Input() dateFormat: string;

  /**
   * Initial value of the hour element.
   */
  @Input() defaultHour?: number;
  /**
   * Initial value of the minute element.
   */
  @Input() defaultMinute?: number;

  /**
   * Initial value of the seconds element.
   */
  @Input() defaultSeconds?: number;

  /**
   * See <a href="https://chmln.github.io/flatpickr/examples/#disabling-specific-dates">disabling dates</a>.
   */
  @Input() disable: DisableEnableDate[];

  /**
   * Set disableMobile to true to always use the non-native picker.
   * By default, Flatpickr utilizes native datetime widgets unless certain options (e.g. disable) are used.
   */
  @Input() disableMobile: boolean;

  /**
   * See <a href="https://chmln.github.io/flatpickr/examples/#disabling-all-dates-except-select-few">enabling dates</a>.
   */
  @Input() enable: DisableEnableDate[];

  /**
   * Enables time picker.
   */
  @Input() enableTime: boolean;

  /**
   * Enables seconds in the time picker.
   */
  @Input() enableSeconds: boolean;

  /**
   * Allows using a custom date formatting function instead of the built-in handling for date formats using dateFormat, altFormat, etc.
   */
  @Input() formatDate?: (value: any) => string;

  /**
   * Adjusts the step for the hour input (incl. scrolling).
   */
  @Input() hourIncrement: number;

  /**
   * Displays the calendar inline.
   */
  @Input() inline: boolean;

  /**
   * The maximum date that a user can pick to (inclusive).
   */
  @Input() maxDate: string | Date;

  /**
   * The minimum date that a user can start picking from (inclusive).
   */
  @Input() minDate: string | Date;

  /**
   * Adjusts the step for the minute input (incl. scrolling).
   */
  @Input() minuteIncrement: number;

  /**
   * Select a single date, multiple dates or a date range.
   */
  @Input() mode: 'single' | 'multiple' | 'range';

  /**
   * HTML for the arrow icon, used to switch months.
   */
  @Input() nextArrow: string;

  /**
   * Hides the day selection in calendar. Use it along with `enableTime` to create a time picker.
   */
  @Input() noCalendar: boolean;

  /**
   * Provide a date for 'today', which will be used instead of "new Date()"
   */
  @Input() now?: Date | string | number;

  /**
   * Function that expects a date string and must return a Date object.
   */
  @Input() parseDate: (str: string) => Date;

  /**
   * HTML for the left arrow icon.
   */
  @Input() prevArrow: string;

  /**
   * Show the month using the shorthand version (ie, Sep instead of September).
   */
  @Input() shorthandCurrentMonth: boolean;

  /**
   * The number of months shown.
   */
  @Input() showMonths: number;

  /**
   * Position the calendar inside the wrapper and next to the input element. (Leave `false` unless you know what you're doing).
   */
  @Input() static: boolean;

  /**
   * Displays time picker in 24 hour mode without AM/PM selection when enabled.
   */
  @Input() time24hr: boolean;

  /**
   * Enables display of week numbers in calendar.
   */
  @Input() weekNumbers: boolean;

  /**
   * You may override the function that extracts the week numbers from a Date by supplying a getWeek function.
   * It takes in a date as a parameter and should return a corresponding string that you want to appear left of every week.
   */
  @Input() getWeek: (date: Date) => string;

  /**
   * Custom elements and input groups.
   */
  @Input() wrap: boolean;

  /**
   * Array of plugin instances to use.
   */
  @Input() plugins: any[];

  /**
   * The locale object or string to use for the locale.
   */
  @Input() locale: object | string;

  /**
   * Auto convert the ngModel value from a string to a date / array of dates / from - to date object depending on the `mode`
   */
  @Input() convertModelValue: boolean;

  /**
   * How the month should be displayed in the header of the calendar.
   */
  @Input() monthSelectorType: 'static' | 'dropdown';

  /**
   * Gets triggered once the calendar is in a ready state
   */
  @Output()
  flatpickrReady: EventEmitter<FlatPickrOutputOptions> = new EventEmitter();

  /**
   * Gets triggered when the user selects a date, or changes the time on a selected date.
   */
  @Output()
  flatpickrChange: EventEmitter<FlatPickrOutputOptions> = new EventEmitter();

  /**
   * Gets triggered when the input value is updated with a new date string.
   */
  @Output()
  flatpickrValueUpdate: EventEmitter<
    FlatPickrOutputOptions
  > = new EventEmitter();

  /**
   * Gets triggered when the calendar is opened.
   */
  @Output()
  flatpickrOpen: EventEmitter<FlatPickrOutputOptions> = new EventEmitter();

  /**
   * Gets triggered when the calendar is closed.
   */
  @Output()
  flatpickrClose: EventEmitter<FlatPickrOutputOptions> = new EventEmitter();

  /**
   * Gets triggered when the month is changed, either by the user or programmatically.
   */
  @Output()
  flatpickrMonthChange: EventEmitter<
    FlatPickrOutputOptions
  > = new EventEmitter();

  /**
   * Gets triggered when the year is changed, either by the user or programmatically.
   */
  @Output()
  flatpickrYearChange: EventEmitter<
    FlatPickrOutputOptions
  > = new EventEmitter();

  /**
   * Take full control of every date cell with this output
   */
  @Output()
  flatpickrDayCreate: EventEmitter<
    FlatPickrDayCreateOutputOptions
  > = new EventEmitter();

  /**
   * The flatpickr instance where you can call methods like toggle(), open(), close() etc
   */
  instance: flatpickr.Instance;

  private isDisabled = false;
  private initialValue: any;

  onChangeFn: (value: any) => void = () => {}; // tslint:disable-line

  onTouchedFn = () => {};

  constructor(
    private elm: ElementRef,
    private defaults: FlatpickrDefaults,
    private renderer: Renderer2
  ) {}

  ngAfterViewInit(): void {
    const options: any = {
      altFormat: this.altFormat,
      altInput: this.altInput,
      altInputClass: this.altInputClass,
      allowInput: this.allowInput,
      appendTo: this.appendTo,
      ariaDateFormat: this.ariaDateFormat,
      clickOpens: this.clickOpens,
      dateFormat: this.dateFormat,
      defaultHour: this.defaultHour,
      defaultMinute: this.defaultMinute,
      defaultSeconds: this.defaultSeconds,
      disable: this.disable,
      disableMobile: this.disableMobile,
      enable: this.enable,
      enableTime: this.enableTime,
      enableSeconds: this.enableSeconds,
      formatDate: this.formatDate,
      hourIncrement: this.hourIncrement,
      defaultDate: this.initialValue,
      inline: this.inline,
      maxDate: this.maxDate,
      minDate: this.minDate,
      minuteIncrement: this.minuteIncrement,
      mode: this.mode,
      nextArrow: this.nextArrow,
      noCalendar: this.noCalendar,
      now: this.now,
      parseDate: this.parseDate,
      prevArrow: this.prevArrow,
      shorthandCurrentMonth: this.shorthandCurrentMonth,
      showMonths: this.showMonths,
      monthSelectorType: this.monthSelectorType,
      static: this.static,
      time24hr: this.time24hr,
      weekNumbers: this.weekNumbers,
      getWeek: this.getWeek,
      wrap: this.wrap,
      plugins: this.plugins,
      locale: this.locale,
      onChange: (selectedDates: Date[], dateString: string, instance: any) => {
        this.flatpickrChange.emit({ selectedDates, dateString, instance });
      },
      onOpen: (selectedDates: Date[], dateString: string, instance: any) => {
        this.flatpickrOpen.emit({ selectedDates, dateString, instance });
      },
      onClose: (selectedDates: Date[], dateString: string, instance: any) => {
        this.flatpickrClose.emit({ selectedDates, dateString, instance });
      },
      onMonthChange: (
        selectedDates: Date[],
        dateString: string,
        instance: any
      ) => {
        this.flatpickrMonthChange.emit({ selectedDates, dateString, instance });
      },
      onYearChange: (
        selectedDates: Date[],
        dateString: string,
        instance: any
      ) => {
        this.flatpickrYearChange.emit({ selectedDates, dateString, instance });
      },
      onReady: (selectedDates: Date[], dateString: string, instance: any) => {
        this.flatpickrReady.emit({ selectedDates, dateString, instance });
      },
      onValueUpdate: (
        selectedDates: Date[],
        dateString: string,
        instance: any
      ) => {
        this.flatpickrValueUpdate.emit({ selectedDates, dateString, instance });
      },
      onDayCreate: (
        selectedDates: Date[],
        dateString: string,
        instance: any,
        dayElement: HTMLElement
      ) => {
        this.flatpickrDayCreate.emit({
          selectedDates,
          dateString,
          instance,
          dayElement
        });
      }
    };

    Object.keys(options).forEach(key => {
      if (typeof options[key] === 'undefined') {
        if (typeof this.options[key] !== 'undefined') {
          options[key] = (this.options as any)[key];
        } else {
          options[key] = (this.defaults as any)[key];
        }
      }
    });
    options.time_24hr = options.time24hr;

    if (typeof this.convertModelValue === 'undefined') {
      this.convertModelValue = this.defaults.convertModelValue;
    }

    // workaround bug in flatpickr 4.6 where it doesn't copy the classes across
    // TODO - remove once fix in https://github.com/flatpickr/flatpickr/issues/1860 is released
    options.altInputClass =
      (options.altInputClass || '') + ' ' + this.elm.nativeElement.className;

    if (!options.enable) {
      delete options.enable;
    }

    this.instance = flatpickr(
      this.elm.nativeElement,
      options
    ) as flatpickr.Instance;
    this.setDisabledState(this.isDisabled);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.instance) {
      Object.keys(changes).forEach(inputKey => {
        this.instance.set(inputKey as any, (this as any)[inputKey]);
      });
    }
  }

  ngOnDestroy(): void {
    if (this.instance) {
      this.instance.destroy();
    }
  }

  writeValue(value: any): void {
    let convertedValue: any = value;
    if (this.convertModelValue && this.mode === 'range' && value) {
      convertedValue = [value.from, value.to];
    }

    if (this.instance) {
      this.instance.setDate(convertedValue);
    } else {
      // flatpickr hasn't been initialised yet, store the value for later use
      this.initialValue = convertedValue;
    }
  }

  registerOnChange(fn: any): void {
    this.onChangeFn = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouchedFn = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
    if (this.instance) {
      if (this.isDisabled) {
        this.renderer.setProperty(this.instance._input, 'disabled', 'disabled');
      } else {
        this.renderer.removeAttribute(this.instance._input, 'disabled');
      }
    }
  }

  @HostListener('input')
  inputChanged(): void {
    const value: string = this.elm.nativeElement.value;
    if (this.convertModelValue && typeof value === 'string') {
      switch (this.mode) {
        case 'multiple':
          const dates: Date[] = value
            .split('; ')
            .map(str =>
              this.instance.parseDate(
                str,
                this.instance.config.dateFormat,
                !this.instance.config.enableTime
              )
            );
          this.onChangeFn(dates);
          break;

        case 'range':
          const [from, to] = value
            .split(this.instance.l10n.rangeSeparator)
            .map(str =>
              this.instance.parseDate(
                str,
                this.instance.config.dateFormat,
                !this.instance.config.enableTime
              )
            );
          this.onChangeFn({ from, to });
          break;

        case 'single':
        default:
          this.onChangeFn(
            this.instance.parseDate(
              value,
              this.instance.config.dateFormat,
              !this.instance.config.enableTime
            )
          );
      }
    } else {
      this.onChangeFn(value);
    }
  }
}
