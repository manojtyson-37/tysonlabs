import { MetadataRoute } from 'next';
import { getApprovedProjects } from '@/data/projects';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://tysonlabs.dev';
  const projects = getApprovedProjects();

  const staticRoutes = [
    '',
    '/projects',
    '/products',
    '/services',
    '/about',
    '/labs',
    '/contact',
    '/privacy',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date('2026-10-27T00:00:00.000Z'),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  const projectRoutes = projects.map((p) => ({
    url: `${baseUrl}/projects/${p.slug}`,
    lastModified: new Date('2026-10-27T00:00:00.000Z'),
    changeFrequency: 'monthly' as const,
    priority: p.featured ? 0.9 : 0.7,
  }));

  return [...staticRoutes, ...projectRoutes];
}
