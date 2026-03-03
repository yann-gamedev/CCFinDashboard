export const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value)
}

export const formatDate = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    }
    return new Date(dateString).toLocaleDateString('id-ID', options)
}

export const formatCompactNumber = (value: number): string => {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}jt`
    if (value >= 1_000) return `${(value / 1_000).toFixed(0)}rb`
    return value.toString()
}
