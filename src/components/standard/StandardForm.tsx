import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, UseFormReturn, FieldValues, DefaultValues } from 'react-hook-form';
import { z } from 'zod';
import { Form } from '@/components/ui/form';
import { StandardButton } from './StandardButton';
import { cn } from '@/lib/utils';

export interface StandardFormProps<TFormValues extends FieldValues> {
  onSubmit: (values: TFormValues) => void;
  schema: z.ZodType<TFormValues>;
  defaultValues?: DefaultValues<TFormValues>;
  children: (form: UseFormReturn<TFormValues>) => React.ReactNode;
  className?: string;
  id?: string;
  submitButtonLabel?: string;
  submitButtonDisabled?: boolean;
  submitButtonLoading?: boolean;
  resetButtonLabel?: string;
  showResetButton?: boolean;
  onReset?: () => void;
  buttonsClassName?: string;
  buttonsAlign?: 'left' | 'center' | 'right';
  buttonsFullWidth?: boolean;
}

/**
 * StandardForm component for consistent form handling with validation
 * 
 * @param props - Form properties
 * @returns Standardized form component
 */
export function StandardForm<TFormValues extends FieldValues>({
  onSubmit,
  schema,
  defaultValues,
  children,
  className,
  id,
  submitButtonLabel = 'Opslaan',
  submitButtonDisabled = false,
  submitButtonLoading = false,
  resetButtonLabel = 'Annuleren',
  showResetButton = false,
  onReset,
  buttonsClassName,
  buttonsAlign = 'right',
  buttonsFullWidth = false,
}: StandardFormProps<TFormValues>) {
  // Initialize form with react-hook-form and zod validation
  const form = useForm<TFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: 'onBlur',
  });

  // Handle form submission
  const handleSubmit = async (values: TFormValues) => {
    try {
      await onSubmit(values);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  // Handle form reset
  const handleReset = () => {
    form.reset(defaultValues);
    if (onReset) {
      onReset();
    }
  };

  // Alignment classes for buttons
  const alignmentClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
  };

  return (
    <Form {...form}>
      <form
        id={id}
        onSubmit={form.handleSubmit(handleSubmit)}
        className={cn('space-y-6', className)}
      >
        {children(form)}

        <div
          className={cn(
            'flex flex-col-reverse sm:flex-row gap-2',
            alignmentClasses[buttonsAlign],
            buttonsClassName
          )}
        >
          {showResetButton && (
            <StandardButton
              type="button"
              variant="outline"
              onClick={handleReset}
              fullWidth={buttonsFullWidth}
            >
              {resetButtonLabel}
            </StandardButton>
          )}

          <StandardButton
            type="submit"
            disabled={submitButtonDisabled || !form.formState.isDirty}
            loading={submitButtonLoading || form.formState.isSubmitting}
            fullWidth={buttonsFullWidth}
          >
            {submitButtonLabel}
          </StandardButton>
        </div>
      </form>
    </Form>
  );
}

export default StandardForm;