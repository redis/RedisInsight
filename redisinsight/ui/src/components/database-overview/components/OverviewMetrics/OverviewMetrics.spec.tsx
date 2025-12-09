import { getCpuDisplayValue, getCpuTooltipValue } from './OverviewMetrics'

describe('getCpuDisplayValue', () => {
  it('should return formatted display value for valid CPU percentage', () => {
    expect(getCpuDisplayValue(50.123)).toBe('50.12 %')
    expect(getCpuDisplayValue(100)).toBe('100 %')
    expect(getCpuDisplayValue(250.567)).toBe('250.57 %')
  })

  it('should return null when CPU percentage is null', () => {
    expect(getCpuDisplayValue(null)).toBeNull()
  })
})

describe('getCpuTooltipValue', () => {
  describe('when maxCpuUsagePercentage is available and > 100%', () => {
    it('should return "current% / max%" format', () => {
      expect(getCpuTooltipValue(150.1234, 400)).toBe('150.1234% / 400%')
      expect(getCpuTooltipValue(250.5678, 400)).toBe('250.5678% / 400%')
      expect(getCpuTooltipValue(100, 200)).toBe('100% / 200%')
    })

    it('should return single number when max is exactly 100%', () => {
      expect(getCpuTooltipValue(50, 100)).toBe('50%')
    })
  })

  describe('when maxCpuUsagePercentage is not available or <= 100%', () => {
    it('should return just "current%" format', () => {
      expect(getCpuTooltipValue(50.1234)).toBe('50.1234%')
      expect(getCpuTooltipValue(100.5678)).toBe('100.5678%')
      expect(getCpuTooltipValue(50.1234, null)).toBe('50.1234%')
      expect(getCpuTooltipValue(50.1234, undefined)).toBe('50.1234%')
      expect(getCpuTooltipValue(50.1234, 100)).toBe('50.1234%')
    })
  })

  describe('when cpuUsagePercentage is null', () => {
    it('should return null', () => {
      expect(getCpuTooltipValue(null)).toBeNull()
      expect(getCpuTooltipValue(null, 400)).toBeNull()
      expect(getCpuTooltipValue(null, null)).toBeNull()
    })
  })
})
