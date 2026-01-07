import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import {
    Building2,
    MapPin,
    Phone,
    MessageSquare,
    ArrowLeft,
    Star,
    Navigation,
    Globe,
    Share2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useMarketplaceStore } from "@/hooks/useMarketplaceStore";
import { toast } from "sonner";

const CENTER_POSITION: [number, number] = [19.0760, 72.8777];

const MarketplaceMap: React.FC = () => {
    const navigate = useNavigate();
    const { businesses = [] } = useMarketplaceStore();
    const [selectedShop, setSelectedShop] = useState<any>(null);
    const [sheetOpen, setSheetOpen] = useState(false);
    const mapRef = useRef<L.Map | null>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const markersRef = useRef<L.Marker[]>([]);

    useEffect(() => {
        if (!mapContainerRef.current) return;

        // Initialize map
        const map = L.map(mapContainerRef.current, {
            zoomControl: false,
            attributionControl: false
        }).setView(CENTER_POSITION, 15);

        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; CARTO'
        }).addTo(map);

        // Custom Marker Icon
        const customIcon = L.icon({
            iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
            iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
            shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        });

        // User Marker
        L.marker(CENTER_POSITION, { icon: customIcon })
            .addTo(map)
            .bindPopup('<b>Your Store</b>');

        // Business Markers
        businesses.forEach((shop: any) => {
            const marker = L.marker([shop.latitude, shop.longitude], { icon: customIcon })
                .addTo(map)
                .on('click', () => {
                    setSelectedShop(shop);
                    setSheetOpen(true);
                });

            marker.bindPopup(`<b>${shop.name}</b><br/>${shop.category}`);
            markersRef.current.push(marker);
        });

        mapRef.current = map;

        return () => {
            map.remove();
            mapRef.current = null;
        };
    }, [businesses]);

    // Handle center changes when a shop is selected from the sidebar
    useEffect(() => {
        if (selectedShop && mapRef.current) {
            mapRef.current.setView([selectedShop.latitude, selectedShop.longitude], 16, { animate: true });
        }
    }, [selectedShop]);

    const handleListClick = (shop: any) => {
        setSelectedShop(shop);
        setSheetOpen(true);
    };

    return (
        <div className="h-[calc(100vh-64px)] w-full flex flex-col relative overflow-hidden bg-white">
            {/* Header Overlay */}
            <div className="absolute top-6 left-6 z-[1000] flex items-center gap-3">
                <Button
                    variant="outline"
                    className="shadow-2xl rounded-2xl bg-white/95 backdrop-blur-md border-none font-bold text-slate-800 h-11"
                    onClick={() => navigate(-1)}
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </Button>
                <div className="bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2 font-black text-sm">
                    <Building2 className="w-4 h-4 text-indigo-400" />
                    Marketplace Hub
                </div>
            </div>

            {/* Sidebar List Overlay */}
            <div className="absolute top-24 left-6 z-[1000] w-80 hidden lg:block">
                <Card className="shadow-2xl border-none bg-white/90 backdrop-blur-xl rounded-[2.5rem] overflow-hidden max-h-[75vh] flex flex-col border border-white/20">
                    <CardHeader className="p-6 pb-2">
                        <CardTitle className="text-lg font-black text-slate-900">Nearby Shops</CardTitle>
                        <CardDescription className="font-bold text-indigo-600 uppercase text-[9px] tracking-widest">{businesses.length} Partners Found</CardDescription>
                    </CardHeader>
                    <CardContent className="p-3 space-y-2 overflow-y-auto">
                        {businesses.map((shop: any) => (
                            <div
                                key={shop.id}
                                onClick={() => handleListClick(shop)}
                                className="p-4 rounded-[2rem] hover:bg-white transition-all cursor-pointer border border-transparent hover:border-indigo-100/50 hover:shadow-lg group bg-slate-50/50"
                            >
                                <div className="flex justify-between items-center mb-1">
                                    <h4 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors text-sm">{shop.name}</h4>
                                    <Badge className="bg-indigo-50 text-indigo-500 border-none text-[8px] font-black uppercase">{shop.category}</Badge>
                                </div>
                                <div className="flex items-center gap-1.5 text-slate-400">
                                    <MapPin className="w-3 h-3" />
                                    <span className="text-[10px] font-bold">Within {Math.round(shop.distance)}m</span>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>

            {/* Raw Leaflet Map Container */}
            <div ref={mapContainerRef} className="flex-1 w-full bg-slate-100 z-0" />

            {/* Shop Detail Sheet */}
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetContent side="right" className="w-full sm:max-w-md border-none shadow-2xl p-0 overflow-hidden bg-slate-50">
                    {selectedShop && (
                        <div className="h-full flex flex-col">
                            <div className="h-52 bg-slate-900 p-8 text-white flex flex-col justify-end relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 rounded-full -mr-32 -mt-32 blur-3xl" />
                                <div className="absolute top-6 right-6">
                                    <Button size="icon" variant="ghost" className="rounded-full bg-white/10 border-none hover:bg-white/20 text-white">
                                        <Share2 className="w-4 h-4" />
                                    </Button>
                                </div>
                                <Badge className="w-fit mb-3 bg-indigo-500 text-white border-none font-black text-[10px]">
                                    {selectedShop.category}
                                </Badge>
                                <h2 className="text-2xl font-black tracking-tight">{selectedShop.name}</h2>
                            </div>

                            <div className="p-6 space-y-6 overflow-y-auto flex-1 text-slate-900 font-sans">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Trust Score</p>
                                        <div className="flex items-center gap-1.5 font-black text-slate-900 text-lg">
                                            4.9 <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                                        </div>
                                    </div>
                                    <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Walking Dist.</p>
                                        <div className="flex items-center gap-1.5 font-black text-slate-900 text-lg">
                                            {Math.round(selectedShop.distance)}m <Navigation className="w-4 h-4 text-indigo-500" />
                                        </div>
                                    </div>
                                </div>

                                <Card className="border-none shadow-sm rounded-3xl bg-white p-6">
                                    <p className="text-sm text-slate-500 leading-relaxed italic">
                                        "A long standing partner of NexVyapaar community, known for quality supply chain integration."
                                    </p>
                                </Card>

                                <div className="space-y-3">
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Collaborate</h3>
                                    <Button
                                        className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 rounded-2xl font-bold text-md shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
                                        onClick={() => {
                                            toast.success(`Inventory Inquiry sent to ${selectedShop.name}`, {
                                                description: "The manager will respond with a catalog link shortly via WhatsApp.",
                                            });
                                        }}
                                    >
                                        <MessageSquare className="w-5 h-5" />
                                        Inquire Inventory
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="w-full h-14 rounded-2xl font-bold border-slate-200 hover:bg-slate-50 hover:text-indigo-600 transition-all flex items-center justify-center gap-2 text-slate-600 bg-white shadow-sm"
                                        onClick={() => {
                                            toast.info(`Connecting to ${selectedShop.name}...`, {
                                                description: "Connecting your business line to the store manager.",
                                            });
                                        }}
                                    >
                                        <Phone className="w-5 h-5" />
                                        Call Shop Manager
                                    </Button>
                                    <Button variant="ghost" className="w-full h-10 rounded-xl font-bold text-indigo-600 hover:bg-indigo-50 flex items-center justify-center gap-2 text-sm">
                                        <Globe className="w-4 h-4" />
                                        Digital Storefront
                                    </Button>
                                </div>
                            </div>

                            <div className="p-6 bg-white border-t border-slate-100 text-center">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">NexVyapaar Verified Network Member</p>
                            </div>
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
};

export default MarketplaceMap;
