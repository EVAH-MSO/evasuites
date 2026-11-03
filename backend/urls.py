from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from users.views import UserViewSet, register, me, change_password
from properties.views import PropertyViewSet, UnitViewSet
from tenants.views import TenantViewSet
from leases.views import LeaseViewSet
from payments.views import PaymentViewSet
from maintenance.views import MaintenanceViewSet

router = DefaultRouter()
# Added basename to all of these!
router.register('users', UserViewSet, basename='user')
router.register('properties', PropertyViewSet, basename='property')
router.register('units', UnitViewSet, basename='unit')
router.register('tenants', TenantViewSet, basename='tenant')
router.register('leases', LeaseViewSet, basename='lease')
router.register('payments', PaymentViewSet, basename='payment')
router.register('maintenance', MaintenanceViewSet, basename='maintenance')

urlpatterns = [
    path('admin/', admin.site.urls),

    # Auth
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/register/', register, name='register'),
    path('api/me/', me, name='me'),
    path('api/change-password/', change_password, name='change_password'),

    # Router endpoints
    path('api/', include(router.urls)),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
