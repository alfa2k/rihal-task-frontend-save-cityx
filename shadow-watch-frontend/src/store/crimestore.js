import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import crimeDataFile from '../data/crimes.json';

const crimeData = crimeDataFile.crimes;

const useCrimeStore = create(
  persist(
    (set, get) => ({
      crimes: crimeData,
      filteredCrimes: crimeData,
      selectedCrimeId: null,
      filters: { crimeType: null, status: null, dateRange: null, search: '' },
      reportForm: { isOpen: false, locationSelectionMode: false, tempLocation: null },
      savedReportData: null, // new property to persist form data
      
      setSelectedCrime: (id) => set({ selectedCrimeId: id }),
      
      toggleReportForm: () => set((state) => ({ 
        reportForm: { 
          ...state.reportForm, 
          isOpen: !state.reportForm.isOpen,
          locationSelectionMode: state.reportForm.isOpen ? false : state.reportForm.locationSelectionMode
        } 
      })),
      
      toggleLocationSelectionMode: () => set((state) => ({ 
        reportForm: { 
          ...state.reportForm, 
          locationSelectionMode: !state.reportForm.locationSelectionMode 
        } 
      })),
      
      setTempLocation: (location) => set((state) => ({ 
        reportForm: { ...state.reportForm, tempLocation: location } 
      })),
      
      setSavedReportData: (data) => set({ savedReportData: data }),
      
      addCrime: (crimeData) => {
        const currentDate = new Date();
        const formattedDateTime = currentDate.toISOString().replace(/[:.]/g, '-').slice(0, 16);
        const highestId = Math.max(...get().crimes.map(crime => Number(crime.id)));
        const nextId = highestId + 1;
        const newCrime = { ...crimeData, id: nextId, report_date_time: formattedDateTime, report_status: 'Pending' };
        set((state) => {
          const updatedCrimes = [...state.crimes, newCrime];
          let shouldIncludeInFiltered = true;
          if (state.filters.crimeType && newCrime.crime_type !== state.filters.crimeType) shouldIncludeInFiltered = false;
          if (state.filters.status && newCrime.report_status !== state.filters.status) shouldIncludeInFiltered = false;
          if (state.filters.search) {
            const searchLower = state.filters.search.toLowerCase();
            const matchesSearch = 
              newCrime.report_details.toLowerCase().includes(searchLower) ||
              newCrime.crime_type.toLowerCase().includes(searchLower) ||
              newCrime.report_status.toLowerCase().includes(searchLower) ||
              newCrime.report_date_time.includes(searchLower);
            if (!matchesSearch) shouldIncludeInFiltered = false;
          }
          return { 
            crimes: updatedCrimes,
            filteredCrimes: shouldIncludeInFiltered ? [...state.filteredCrimes, newCrime] : [...state.filteredCrimes],
            reportForm: { isOpen: false, locationSelectionMode: false, tempLocation: null },
            savedReportData: null
          };
        });
        return newCrime;
      },
      
      updateCrimeStatus: (id, newStatus) => {
        set((state) => {
          const updatedCrimes = state.crimes.map(crime => 
            crime.id === id ? { ...crime, report_status: newStatus } : crime
          );
          const updatedFiltered = state.filteredCrimes.map(crime => 
            crime.id === id ? { ...crime, report_status: newStatus } : crime
          );
          if (state.filters.status && newStatus !== state.filters.status) {
            return {
              crimes: updatedCrimes,
              filteredCrimes: state.filteredCrimes.filter(crime => crime.id !== id)
            };
          }
          return { crimes: updatedCrimes, filteredCrimes: updatedFiltered };
        });
      },
      
      setFilter: (filterType, value) => {
        set((state) => ({ filters: { ...state.filters, [filterType]: value } }));
        const { crimes, filters } = get();
        const updatedFilters = { ...filters, [filterType]: value };
        let filtered = [...crimes];
        if (updatedFilters.crimeType) filtered = filtered.filter(crime => crime.crime_type === updatedFilters.crimeType);
        if (updatedFilters.status) filtered = filtered.filter(crime => crime.report_status === updatedFilters.status);
        if (updatedFilters.search) {
          const searchLower = updatedFilters.search.toLowerCase();
          filtered = filtered.filter(crime => 
            crime.report_details.toLowerCase().includes(searchLower) ||
            crime.crime_type.toLowerCase().includes(searchLower) ||
            crime.report_status.toLowerCase().includes(searchLower) ||
            crime.report_date_time.includes(searchLower)
          );
        }
        set({ filteredCrimes: filtered });
      },
      
      clearFilters: () => {
        set((state) => ({
          filters: { crimeType: null, status: null, dateRange: null, search: '' },
          filteredCrimes: [...state.crimes]
        }));
      },
      
      initializeFromStorage: () => {}
    }),
    {
      name: 'crime-data-storage',
      storage: createJSONStorage(() => localStorage)
    }
  )
);

export default useCrimeStore;
