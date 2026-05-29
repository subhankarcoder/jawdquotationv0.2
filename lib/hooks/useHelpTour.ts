'use client';

import { useEffect, useCallback } from 'react';
import { driver, DriveStep } from 'driver.js';
import 'driver.js/dist/driver.css';

export function useHelpTour(getSteps: () => DriveStep[]) {
  const triggerTour = useCallback(() => {
    const rawSteps = getSteps();
    
    // Filter steps to only include those whose targeted element is currently visible in the DOM
    // or global modal/page-wide steps that do not specify a target element.
    const visibleSteps = rawSteps.filter(step => {
      if (typeof window === 'undefined') return false;
      if (!step.element) return true; 
      
      const targetSelector = typeof step.element === 'string'
        ? step.element
        : '';
        
      if (!targetSelector) return true;
      
      const el = document.querySelector(targetSelector);
      return !!el;
    });

    if (visibleSteps.length === 0) return;

    const driverObj = driver({
      showProgress: true,
      animate: true,
      allowClose: true,
      stagePadding: 6,
      steps: visibleSteps.map(step => ({
        ...step,
        popover: {
          side: 'bottom',
          align: 'start',
          ...step.popover,
          nextBtnText: 'Next →',
          prevBtnText: '← Prev',
          doneBtnText: 'Finish 🎉',
        }
      }))
    });

    driverObj.drive();
  }, [getSteps]);

  useEffect(() => {
    window.addEventListener('trigger-help-tour', triggerTour);
    return () => {
      window.removeEventListener('trigger-help-tour', triggerTour);
    };
  }, [triggerTour]);

  return triggerTour;
}
