/* eslint-disable react-hooks/rules-of-hooks */
import { MetadataRoute } from 'next'
export default function sitemap(): MetadataRoute.Sitemap {
    const BASE_URL = process.env.NEXT_PUBLIC_DOMAIN || ''
    return [
        {
            url: BASE_URL,
            lastModified: new Date(),
            priority: 1
        },
        {
            url: BASE_URL + "/about",
            lastModified: new Date(),
            priority: 0.5
        },
        {
            url: BASE_URL + "/privacy",
            lastModified: new Date(),
            priority: 0.5
        },
        {
            url: BASE_URL + "/terms",
            lastModified: new Date(),
            priority: 0.5
        }
    ]
}