const SITE_NAME = 'Aaron Tilley'

export function pageTitle(name?: string) {
  return name ? `${name} | ${SITE_NAME}` : SITE_NAME
}
