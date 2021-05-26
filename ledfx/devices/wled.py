import logging
from distutils.version import StrictVersion

import voluptuous as vol

from ledfx.devices import NetworkedDevice
from ledfx.devices.ddp import DDPDevice
from ledfx.devices.e131 import E131Device
from ledfx.devices.udp import UDPDevice
from ledfx.utils import WLED

_LOGGER = logging.getLogger(__name__)


class WLEDDevice(NetworkedDevice):
    """Dedicated WLED device support"""

    CONFIG_SCHEMA = vol.Schema(
        {
            vol.Optional(
                "sync_mode",
                description="Streaming protocol to WLED device. Recommended: UDP<480px, DDP>480px",
                default="UDP",
            ): vol.In(["UDP", "DDP", "E131"]),
            vol.Optional(
                "timeout",
                description="Time between LedFx effect off and WLED effect activate",
                default=1,
            ): vol.All(vol.Coerce(int), vol.Range(0, 10)),
        }
    )

    SYNC_MODES = {
        "UDP": UDPDevice,
        "DDP": DDPDevice,
        "E131": E131Device,
    }

    DEVICE_CONFIGS = {
        "UDP": {
            "name": None,
            "ip_address": None,
            "pixel_count": None,
            "port": 21324,
            "include_indexes": False,
            "data_prefix": None,
        },
        "DDP": {
            "name": None,
            "ip_address": None,
            "pixel_count": None,
        },
        "E131": {
            "name": None,
            "ip_address": None,
            "pixel_count": None,
            "universe": 1,
            "universe_size": 510,
            "channel_offset": 0,
        },
    }

    def __init__(self, ledfx, config):
        super().__init__(ledfx, config)
        self.subdevice = None

    def config_updated(self, config):
        if not isinstance(
            self.subdevice, self.SYNC_MODES[self._config["sync_mode"]]
        ):
            self.setup_subdevice()

    def setup_subdevice(self):
        if self.subdevice is not None:
            self.subdevice.deactivate()

        device = self.SYNC_MODES[self._config["sync_mode"]]
        config = self.DEVICE_CONFIGS[self._config["sync_mode"]]
        config["name"] = self._config["name"]
        config["ip_address"] = self._config["ip_address"]
        config["pixel_count"] = self._config["pixel_count"]

        if self._config["sync_mode"] == "UDP":
            config["data_prefix"] = "02%02X" % self._config["timeout"]

        self.subdevice = device(self._ledfx, config)
        self.subdevice._destination = self._destination

    def activate(self):
        if self.subdevice is None:
            self.setup_subdevice()
        self.subdevice.activate()
        super().activate()

    def deactivate(self):
        if self.subdevice is not None:
            self.subdevice.deactivate()
        super().deactivate()

    def flush(self, data):
        self.subdevice.flush(data)

    async def async_initialize(self):
        await super().async_initialize()
        self.wled = WLED(self.destination)
        wled_config = await self.wled.get_config()
        await self.wled.get_sync_settings()

        led_info = wled_config["leds"]
        wled_name = wled_config["name"]
        wled_count = led_info["count"]
        wled_rgbmode = led_info["rgbw"]
        wled_version = wled_config["ver"]

        wled_config = {
            "name": wled_name,
            "pixel_count": wled_count,
            "rgbw_led": wled_rgbmode,
        }
        # that's a nice operation u got there python

        self._config |= wled_config
        self.setup_subdevice()

        # Currently *assuming* that this PR gets released in 0.13
        # https://github.com/Aircoookie/WLED/pull/1944
        if StrictVersion(wled_version) >= StrictVersion("0.13.0"):
            _LOGGER.info(
                f"WLED Version Supports Sync Setting API: {wled_version}"
            )
            # self.wled.enable_realtime_gamma()
            # self.wled.set_inactivity_timeout(self._config["timeout"])
            # self.wled.first_universe()
            # self.wled.first_dmx_address()
            # self.wled.multirgb_dmx_mode()

        await self.wled.flush_sync_settings()