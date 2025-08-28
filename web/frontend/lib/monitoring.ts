import { PrismaClient } from "@prisma/client";
import { performance } from "perf_hooks";

const prisma = new PrismaClient();

export interface SecurityAlert {
  type: 'CROSS_TENANT_ATTEMPT' | 'ADMIN_ESCALATION' | 'INVALID_SHOP_ACCESS' | 'SUSPICIOUS_ACTIVITY';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  shopId?: string;
  userId?: string;
  details: Record<string, any>;
  timestamp: Date;
  resolved: boolean;
}

export interface PerformanceMetric {
  operation: string;
  shopId: string;
  duration: number;
  requestPath: string;
  timestamp: Date;
  success: boolean;
  errorType?: string;
}

export interface ShopActivity {
  shopId: string;
  shopName: string;
  activeUsers: number;
  totalRequests: number;
  avgResponseTime: number;
  errorRate: number;
  lastActivity: Date;
  alerts: number;
}

/**
 * SYSTÈME DE MONITORING ET MÉTRIQUES
 * 
 * Surveille la sécurité, les performances et l'activité
 * de l'architecture multi-tenant en temps réel.
 */
class MonitoringService {
  private static instance: MonitoringService;
  private metricsBuffer: PerformanceMetric[] = [];
  private alertsBuffer: SecurityAlert[] = [];
  private readonly BUFFER_SIZE = 1000;
  private readonly FLUSH_INTERVAL = 30000; // 30 secondes

  private constructor() {
    // Flush périodique des métriques en base
    setInterval(() => {
      this.flushMetrics();
    }, this.FLUSH_INTERVAL);
  }

  public static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService();
    }
    return MonitoringService.instance;
  }

  /**
   * Enregistre une métrique de performance
   */
  public recordPerformance(
    operation: string,
    shopId: string,
    duration: number,
    requestPath: string,
    success: boolean = true,
    errorType?: string
  ): void {
    const metric: PerformanceMetric = {
      operation,
      shopId,
      duration,
      requestPath,
      timestamp: new Date(),
      success,
      errorType
    };

    this.metricsBuffer.push(metric);

    // Alertes automatiques sur performances dégradées
    if (duration > 5000) { // > 5 secondes
      this.createSecurityAlert({
        type: 'SUSPICIOUS_ACTIVITY',
        severity: 'MEDIUM',
        shopId,
        details: {
          reason: 'SLOW_RESPONSE',
          operation,
          duration,
          requestPath
        },
        timestamp: new Date(),
        resolved: false
      });
    }

    // Nettoyer le buffer si trop plein
    if (this.metricsBuffer.length > this.BUFFER_SIZE) {
      this.flushMetrics();
    }
  }

  /**
   * Enregistre une alerte de sécurité
   */
  public createSecurityAlert(alert: Omit<SecurityAlert, 'timestamp'>): void {
    const fullAlert: SecurityAlert = {
      ...alert,
      timestamp: new Date()
    };

    this.alertsBuffer.push(fullAlert);

    // Log immédiat pour les alertes critiques
    if (alert.severity === 'CRITICAL' || alert.severity === 'HIGH') {
      console.error(`🚨 SECURITY ALERT [${alert.severity}]:`, {
        type: alert.type,
        shopId: alert.shopId,
        userId: alert.userId,
        details: alert.details
      });
    }

    // Nettoyer le buffer si trop plein
    if (this.alertsBuffer.length > this.BUFFER_SIZE) {
      this.flushAlerts();
    }
  }

  /**
   * Surveille une tentative d'accès cross-tenant
   */
  public alertCrossTenantAttempt(
    userId: string,
    userShopId: string,
    attemptedShopId: string,
    resource: string,
    requestPath: string
  ): void {
    this.createSecurityAlert({
      type: 'CROSS_TENANT_ATTEMPT',
      severity: 'HIGH',
      shopId: userShopId,
      userId,
      details: {
        attemptedShopId,
        resource,
        requestPath,
        userAgent: 'unknown' // Peut être enrichi
      },
      resolved: false
    });
  }

  /**
   * Surveille une tentative d'escalade de privilèges
   */
  public alertAdminEscalation(
    userId: string,
    shopId: string,
    currentRole: string,
    attemptedAction: string,
    requestPath: string
  ): void {
    this.createSecurityAlert({
      type: 'ADMIN_ESCALATION',
      severity: 'CRITICAL',
      shopId,
      userId,
      details: {
        currentRole,
        attemptedAction,
        requestPath
      },
      resolved: false
    });
  }

  /**
   * Récupère l'activité par boutique
   */
  public async getShopActivity(timeRange: '1h' | '24h' | '7d' = '24h'): Promise<ShopActivity[]> {
    const hoursAgo = timeRange === '1h' ? 1 : (timeRange === '24h' ? 24 : 168);
    const since = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);

    // Simuler les métriques (en production, ceci viendrait d'une table de métriques)
    const shops = await prisma.shop.findMany({
      select: {
        id: true,
        shopName: true,
        users: {
          select: { id: true, updatedAt: true }
        }
      }
    });

    const activities: ShopActivity[] = [];

    for (const shop of shops) {
      const activeUsers = shop.users.filter(u => u.updatedAt > since).length;
      
      // Calculer les métriques depuis le buffer et la base
      const shopMetrics = this.metricsBuffer.filter(m => m.shopId === shop.id && m.timestamp > since);
      const shopAlerts = this.alertsBuffer.filter(a => a.shopId === shop.id && a.timestamp > since);

      const totalRequests = shopMetrics.length;
      const successfulRequests = shopMetrics.filter(m => m.success).length;
      const avgResponseTime = totalRequests > 0 
        ? shopMetrics.reduce((sum, m) => sum + m.duration, 0) / totalRequests 
        : 0;
      const errorRate = totalRequests > 0 
        ? ((totalRequests - successfulRequests) / totalRequests) * 100 
        : 0;

      const lastActivity = shop.users.length > 0 
        ? new Date(Math.max(...shop.users.map(u => u.updatedAt.getTime())))
        : new Date(0);

      activities.push({
        shopId: shop.id,
        shopName: shop.shopName,
        activeUsers,
        totalRequests,
        avgResponseTime: Math.round(avgResponseTime),
        errorRate: Math.round(errorRate * 100) / 100,
        lastActivity,
        alerts: shopAlerts.length
      });
    }

    return activities.sort((a, b) => b.totalRequests - a.totalRequests);
  }

  /**
   * Récupère les alertes récentes
   */
  public async getRecentAlerts(limit: number = 50): Promise<SecurityAlert[]> {
    // En production, ceci viendrait d'une table d'alertes persistée
    return this.alertsBuffer
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  /**
   * Statistiques globales du système
   */
  public async getSystemStats(): Promise<{
    totalShops: number;
    activeShops24h: number;
    totalUsers: number;
    activeUsers24h: number;
    avgResponseTime: number;
    errorRate: number;
    criticalAlerts: number;
  }> {
    const [totalShops, totalUsers] = await Promise.all([
      prisma.shop.count(),
      prisma.user.count()
    ]);

    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const activeUsers24h = await prisma.user.count({
      where: { updatedAt: { gte: last24h } }
    });

    // Calculer depuis les métriques en mémoire
    const recentMetrics = this.metricsBuffer.filter(m => m.timestamp > last24h);
    const avgResponseTime = recentMetrics.length > 0
      ? recentMetrics.reduce((sum, m) => sum + m.duration, 0) / recentMetrics.length
      : 0;

    const successfulRequests = recentMetrics.filter(m => m.success).length;
    const errorRate = recentMetrics.length > 0
      ? ((recentMetrics.length - successfulRequests) / recentMetrics.length) * 100
      : 0;

    const criticalAlerts = this.alertsBuffer.filter(
      a => a.timestamp > last24h && (a.severity === 'CRITICAL' || a.severity === 'HIGH')
    ).length;

    // Calculer les boutiques actives (avec au moins une métrique récente)
    const activeShopIds = new Set(recentMetrics.map(m => m.shopId));
    const activeShops24h = activeShopIds.size;

    return {
      totalShops,
      activeShops24h,
      totalUsers,
      activeUsers24h,
      avgResponseTime: Math.round(avgResponseTime),
      errorRate: Math.round(errorRate * 100) / 100,
      criticalAlerts
    };
  }

  /**
   * Marque une alerte comme résolue
   */
  public resolveAlert(alertIndex: number): void {
    if (this.alertsBuffer[alertIndex]) {
      this.alertsBuffer[alertIndex].resolved = true;
    }
  }

  /**
   * Flush les métriques en base (simulation)
   */
  private async flushMetrics(): Promise<void> {
    if (this.metricsBuffer.length === 0) return;

    // En production, sauvegarder en base
    console.log(`📊 Flushing ${this.metricsBuffer.length} performance metrics`);
    
    // Nettoyer le buffer
    this.metricsBuffer = [];
  }

  /**
   * Flush les alertes en base (simulation)
   */
  private async flushAlerts(): Promise<void> {
    if (this.alertsBuffer.length === 0) return;

    const unresolved = this.alertsBuffer.filter(a => !a.resolved);
    console.log(`🚨 Flushing ${this.alertsBuffer.length} security alerts (${unresolved.length} unresolved)`);
    
    // En production, sauvegarder en base
    // await prisma.securityAlert.createMany({ data: this.alertsBuffer });
    
    // Garder seulement les alertes non résolues récentes
    const recent = new Date(Date.now() - 24 * 60 * 60 * 1000);
    this.alertsBuffer = this.alertsBuffer.filter(a => !a.resolved && a.timestamp > recent);
  }

  /**
   * Middleware pour mesurer automatiquement les performances
   */
  public createPerformanceMiddleware() {
    return (operation: string) => {
      return (target: any, propertyName: string, descriptor: PropertyDescriptor) => {
        const method = descriptor.value;

        descriptor.value = async function (...args: any[]) {
          const start = performance.now();
          let success = true;
          let errorType: string | undefined;

          try {
            const result = await method.apply(this, args);
            return result;
          } catch (error) {
            success = false;
            errorType = error instanceof Error ? error.constructor.name : 'UnknownError';
            throw error;
          } finally {
            const duration = performance.now() - start;
            const shopId = args[0]?.shopId || 'unknown';
            const requestPath = args[0]?.url || propertyName;

            MonitoringService.getInstance().recordPerformance(
              operation,
              shopId,
              duration,
              requestPath,
              success,
              errorType
            );
          }
        };
      };
    };
  }
}

// Export du singleton
export const monitoring = MonitoringService.getInstance();

/**
 * Décorateur pour surveiller automatiquement les performances
 */
export const MonitorPerformance = (operation: string) => {
  return monitoring.createPerformanceMiddleware()(operation);
};

/**
 * Helper pour mesurer manuellement une opération
 */
export async function measureOperation<T>(
  operation: string,
  shopId: string,
  requestPath: string,
  fn: () => Promise<T>
): Promise<T> {
  const start = performance.now();
  let success = true;
  let errorType: string | undefined;

  try {
    const result = await fn();
    return result;
  } catch (error) {
    success = false;
    errorType = error instanceof Error ? error.constructor.name : 'UnknownError';
    throw error;
  } finally {
    const duration = performance.now() - start;
    monitoring.recordPerformance(operation, shopId, duration, requestPath, success, errorType);
  }
}

/**
 * Helper pour vérifier et alerter sur les violations d'isolation
 */
export async function checkIsolationViolation(
  userId: string,
  requestedShopId: string,
  requestPath: string
): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { shopId: true }
    });

    if (!user) {
      monitoring.createSecurityAlert({
        type: 'INVALID_SHOP_ACCESS',
        severity: 'HIGH',
        userId,
        details: {
          reason: 'USER_NOT_FOUND',
          requestedShopId,
          requestPath
        },
        resolved: false
      });
      return;
    }

    if (user.shopId !== requestedShopId) {
      monitoring.alertCrossTenantAttempt(
        userId,
        user.shopId,
        requestedShopId,
        'data_access',
        requestPath
      );
    }
  } catch (error) {
    monitoring.createSecurityAlert({
      type: 'SUSPICIOUS_ACTIVITY',
      severity: 'MEDIUM',
      userId,
      details: {
        reason: 'ISOLATION_CHECK_FAILED',
        error: error instanceof Error ? error.message : 'Unknown error',
        requestPath
      },
      resolved: false
    });
  }
}

export default monitoring;