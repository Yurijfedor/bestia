import "./BookingForm.css";

import { useState } from "react";

import {
  getTodayDate,
  isSunday,
  getAvailableTimes,
} from "../../helpers/bookingHelpers";

import type { Service } from "../../types/service";

interface BookingFormProps {
  selectedService: Service | null;
}

function BookingForm({ selectedService }: BookingFormProps) {
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [visitDate, setVisitDate] = useState("");
  const [visitTime, setVisitTime] = useState("");

  const [showSummary, setShowSummary] = useState(false);

  const availableTimes = selectedService
    ? getAvailableTimes(visitDate, selectedService.durationMinutes)
    : [];

  return (
    <div className="container booking-intro">
      <p className="eyebrow">Онлайн-запис</p>

      <h2>Обери зручний час для себе</h2>

      {selectedService ? (
        <>
          <div className="booking-selection">
            <h3>Обрана послуга: {selectedService.name}</h3>

            <p>
              Вартість: {selectedService.price} грн · Тривалість:{" "}
              {selectedService.durationMinutes} хв
            </p>
          </div>

          <form
            className="booking-form"
            onSubmit={(event) => {
              event.preventDefault();
              setShowSummary(true);
            }}
          >
            <label>
              Ваше ім’я
              <input
                type="text"
                value={clientName}
                onChange={(event) => setClientName(event.target.value)}
                required
                autoComplete="name"
                placeholder="Наприклад, Олена"
              />
            </label>

            <label>
              Номер телефону
              <input
                type="tel"
                value={clientPhone}
                onChange={(event) => {
                  const value = event.target.value;

                  if (/^[0-9+()\s-]*$/.test(value)) {
                    setClientPhone(value);
                  }
                }}
                pattern="^\+?[0-9\s()-]{7,20}$"
                title="Введи номер телефону: щонайменше 7 цифр, можна використовувати +, пробіли, дужки та дефіси."
                required
                autoComplete="tel"
                placeholder="+380 98 123 45 67"
              />
            </label>

            <label>
              Дата візиту
              <input
                type="date"
                value={visitDate}
                min={getTodayDate()}
                onChange={(event) => {
                  const date = event.target.value;

                  if (isSunday(date)) {
                    setVisitDate("");
                    setVisitTime("");
                    return;
                  }

                  setVisitDate(date);
                  setVisitTime("");
                }}
                required
              />
            </label>

            <label>
              Час візиту
              <select
                value={visitTime}
                onChange={(event) => setVisitTime(event.target.value)}
                required
                disabled={!visitDate || availableTimes.length === 0}
              >
                <option value="">Обери час</option>

                {availableTimes.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </label>

            <button className="button" type="submit">
              Перевірити запис
            </button>
          </form>

          {showSummary && selectedService && (
            <div className="booking-summary">
              <h3>Перевір свій запис</h3>

              <p>
                <strong>Послуга:</strong> {selectedService.name}
              </p>
              <p>
                <strong>Вартість:</strong> {selectedService.price} грн
              </p>
              <p>
                <strong>Тривалість:</strong> {selectedService.durationMinutes}{" "}
                хв
              </p>
              <p>
                <strong>Ім’я:</strong> {clientName}
              </p>
              <p>
                <strong>Телефон:</strong> {clientPhone}
              </p>
              <p>
                <strong>Дата:</strong> {visitDate}
              </p>
              <p>
                <strong>Час:</strong> {visitTime}
              </p>

              <p>Це попередній перегляд. Запис ще не збережено.</p>

              <button
                className="button"
                type="button"
                onClick={() => setShowSummary(false)}
              >
                Повернутися до форми
              </button>
            </div>
          )}
        </>
      ) : (
        <p>Спочатку обери послугу в каталозі.</p>
      )}
    </div>
  );
}

export default BookingForm;
