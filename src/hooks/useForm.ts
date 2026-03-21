import { useState, useCallback, ChangeEvent, FocusEvent } from 'react';

/**
 * Form field validation function type
 */
type Validator<T> = (value: T) => string | undefined;

/**
 * Form state for a single field
 */
interface FieldState<T = string> {
  value: T;
  error?: string;
  touched: boolean;
}

/**
 * Configuration for useForm hook
 */
interface UseFormConfig<T> {
  initialValues: T;
  validators: {
    [K in keyof T]?: Validator<T[K]>;
  };
  onSubmit: (values: T) => Promise<void> | void;
}

/**
 * Return type for useForm hook
 */
interface UseFormReturn<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  isValid: boolean;
  handleChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleBlur: (e: FocusEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  setFieldError: (field: keyof T, error: string) => void;
}

/**
 * Custom hook for form state management with validation
 * @param config - Form configuration object
 * @returns Form state and handlers
 */
export function useForm<T extends Record<string, string>>(
  config: UseFormConfig<T>,
): UseFormReturn<T> {
  const { initialValues, validators, onSubmit } = config;

  // Initialize field states
  const [fields, setFields] = useState<Record<keyof T, FieldState>>(
    Object.keys(initialValues).reduce((acc, key) => {
      acc[key as keyof T] = {
        value: initialValues[key as keyof T],
        touched: false,
      };
      return acc;
    }, {} as Record<keyof T, FieldState>),
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Validates a single field
   */
  const validateField = useCallback(
    (name: keyof T, value: string): string | undefined => {
      const validator = validators[name];
      if (validator) {
        return validator(value);
      }
      return undefined;
    },
    [validators],
  );

  /**
   * Validates all fields
   */
  const validateAll = useCallback((): boolean => {
    let isValid = true;
    const newFields = { ...fields };

    (Object.keys(fields) as Array<keyof T>).forEach((key) => {
      const error = validateField(key, fields[key].value);
      newFields[key] = { ...fields[key], error, touched: true };
      if (error) isValid = false;
    });

    setFields(newFields);
    return isValid;
  }, [fields, validateField]);

  /**
   * Handle input change
   */
  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      const error = validateField(name as keyof T, value);

      setFields((prev) => ({
        ...prev,
        [name]: {
          ...prev[name as keyof T],
          value,
          error,
        },
      }));
    },
    [validateField],
  );

  /**
   * Handle input blur (mark as touched)
   */
  const handleBlur = useCallback(
    (e: FocusEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      const error = validateField(name as keyof T, value);

      setFields((prev) => ({
        ...prev,
        [name]: {
          ...prev[name as keyof T],
          touched: true,
          error,
        },
      }));
    },
    [validateField],
  );

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!validateAll()) return;

      setIsSubmitting(true);
      try {
        const values = (Object.keys(fields) as Array<keyof T>).reduce(
          (acc, key) => {
            acc[key] = fields[key].value as T[keyof T];
            return acc;
          },
          {} as T,
        );
        await onSubmit(values);
      } finally {
        setIsSubmitting(false);
      }
    },
    [fields, validateAll, onSubmit],
  );

  /**
   * Set a field error manually (e.g., from server response)
   */
  const setFieldError = useCallback((field: keyof T, error: string) => {
    setFields((prev) => ({
      ...prev,
      [field]: {
        ...prev[field],
        error,
      },
    }));
  }, []);

  // Extract values, errors, and touched state
  const values = (Object.keys(fields) as Array<keyof T>).reduce(
    (acc, key) => {
      acc[key] = fields[key].value as T[keyof T];
      return acc;
    },
    {} as T,
  );

  const errors = (Object.keys(fields) as Array<keyof T>).reduce(
    (acc, key) => {
      acc[key] = fields[key].error;
      return acc;
    },
    {} as Partial<Record<keyof T, string>>,
  );

  const touched = (Object.keys(fields) as Array<keyof T>).reduce(
    (acc, key) => {
      acc[key] = fields[key].touched;
      return acc;
    },
    {} as Partial<Record<keyof T, boolean>>,
  );

  const isValid =
    (Object.keys(fields) as Array<keyof T>).every(
      (key) => !fields[key].error,
    ) &&
    (Object.keys(fields) as Array<keyof T>).every((key) => fields[key].touched);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldError,
  };
}