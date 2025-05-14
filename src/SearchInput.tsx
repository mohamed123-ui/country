"use client"
import imogy from ".././public/images.png"
import axios from 'axios'
import { useFormik } from 'formik'
import Image from 'next/image'
import React, { useState } from 'react'

type CountryType = {
  name: {
    common: string;
  };
  capital?: string[];
  region: string;
  flags: {
    png: string;
    alt?: string;
  };
  cca3: string;
  population: number;
  timezones: string[]; 
  currencies?: {
    [key: string]: {
      name: string;
      symbol?: string;
    };
  };
}

export default function SearchInput() {
  const [countries, setCountries] = useState<CountryType[]>([])
  const [error, setError] = useState<string>("")
  const [blockedCountry, setBlockedCountry] = useState<boolean>(false)

  async function getCountry(country: string) {
    try {
      const response = await axios.get<CountryType[]>(`https://restcountries.com/v3.1/name/${country}`);
      setCountries(response.data)
      setError("")
    } catch (error) {
      setCountries([])
      setError("No country found or something went wrong.")
      console.error(error)
    }
  }

  const formik = useFormik({
    initialValues: {
      search: ""
    },
    onSubmit(values) {
      const countryInput = values.search.trim().toLowerCase();

      if (countryInput === "israel") {
        setCountries([]);
        setBlockedCountry(true);
        return;
      }

      setBlockedCountry(false);
      getCountry(countryInput);
    },
  })

  function convertTimezoneToLocalTime(timezoneStr: string): string {
    const match = timezoneStr.match(/UTC([+-])(\d{2}):?(\d{2})?/);
    if (!match) return "Unknown";

    const sign = match[1] === "+" ? 1 : -1;
    const hours = parseInt(match[2], 10);
    const minutes = parseInt(match[3] || "0", 10);

    const offsetMs = sign * (hours * 60 + minutes) * 60 * 1000;
    const localTime = new Date(Date.now() + offsetMs);
    return localTime.toLocaleString();
  }

  return (
    <div className='py-24'>
      <div className='w-[60%] m-auto py-9 bg-white rounded-xl'>
        <h1 className="text-black text-center font-bold  text-2xl mb-1.5">Search About  your country</h1>
        <form onSubmit={formik.handleSubmit} className="max-w-md mx-auto">
          <label htmlFor="default-search" className="sr-only">Search</label>
          <div className="relative">
            <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
              <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 20 20">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
              </svg>
            </div>
            <input
              name="search"
              value={formik.values.search}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              type="search"
              id="default-search"
              placeholder="Enter Your Country"
              required
              className="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50"
            />
            <button type="submit" className="text-white absolute end-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm px-4 py-2">
              Search
            </button>
          </div>
        </form>

        <div className="mt-6 max-w-md mx-auto">
          {blockedCountry && (
            <div className="text-center">
                <Image src={imogy} width={200} height={200} alt="imogy" />
              <p className="text-red-600 mt-4 font-semibold">israel is not a country </p>
            </div>
          )}

          {error && <p className="text-red-500">{error}</p>}
          {!error && countries.length === 0 && !blockedCountry && <h2>No countries found</h2>}

          {countries.map((country) => {
            const timezone = country.timezones?.[0] || "UTC+00:00";
            const localTime = convertTimezoneToLocalTime(timezone);
            const currencyCode = Object.keys(country.currencies || {})[0];
            const currency = country.currencies?.[currencyCode];

            return (
              <div key={country.cca3} className="p-4 mb-2 border rounded bg-white shadow">
                <h3 className="font-bold text-lg">{country.name.common}</h3>
                <p><strong>Capital:</strong> {country.capital?.[0] || "N/A"}</p>
                <p><strong>Region:</strong> {country.region}</p>
                <p><strong>Population:</strong> {country.population.toLocaleString()}</p>
                <p><strong>TimeZone:</strong> {timezone}</p>
                <p><strong>Local Time:</strong> {localTime}</p>
                <p><strong>Currency:</strong> {currency?.name} {currency?.symbol && `(${currency.symbol})`}</p>
                <img src={country.flags.png} alt={country.flags.alt || `${country.name.common} flag`} className="w-20 mt-2" />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  )
}
