

export const saveToLocalStorage = <T>(key: string, data: T[] | unknown) => {
    try {
      const serializedData = JSON.stringify(data);
      localStorage.setItem(key, serializedData);
    } catch (error) {
      console.error('Error saving to localStorage', error);
    }
  };


export const loadFromLocalStorage = <T>(key: string): T[] | null => {
    try {
      const serializedData = localStorage.getItem(key);

      console.log(serializedData);
      if (serializedData === null || serializedData === undefined) {
        return [];
      }
      return JSON.parse(serializedData) as T[];
    } catch (error) {
      console.error('Error loading from localStorage', error);
      return [];
    }
  };