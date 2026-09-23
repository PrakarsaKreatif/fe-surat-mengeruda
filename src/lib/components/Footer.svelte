<footer class="bg-slate-900 text-slate-300 border-t border-slate-800 mt-auto">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <!-- Brand -->
            <div>
                <div class="flex items-center gap-3 mb-3">
                    <img src="/logo.png" alt="Logo Desa Mengeruda" class="w-9 h-9 object-contain drop-shadow shrink-0" />
                    <span class="font-bold text-white text-lg tracking-wide">E-SURAT DESA MENGERUDA</span>
                </div>
                <p class="text-sm text-slate-400 leading-relaxed">
                    Sistem Pelayanan Surat Menyurat Digital resmi Pemerintah Desa Mengeruda, Kecamatan Soa, Kabupaten Nagekeo, Nusa Tenggara Timur.
                </p>
            </div>

            <!-- Layanan -->
            <div>
                <h4 class="text-white font-semibold mb-3 text-sm uppercase tracking-wider">Layanan Warga</h4>
                <ul class="space-y-2 text-sm text-slate-400">
                    <li><a href={import.meta.env.VITE_PUBLIC_SSO_URL || 'http://localhost:5176/'} class="hover:text-white transition-colors">Pendaftaran Akun Baru</a></li>
                    <li><a href="/dashboard" class="hover:text-white transition-colors">Pengajuan Surat Domisili</a></li>
                    <li><a href="/dashboard" class="hover:text-white transition-colors">Pengajuan Surat Keterangan Usaha (SKU)</a></li>
                    <li><a href="/dashboard" class="hover:text-white transition-colors">Pengajuan SKTM</a></li>
                </ul>
            </div>

            <!-- Kontak -->
            <div>
                <h4 class="text-white font-semibold mb-3 text-sm uppercase tracking-wider">Kontak & Bantuan</h4>
                <ul class="space-y-2 text-sm text-slate-400">
                    <li>Alamat: Jl. Raya Mengeruda, Soa, Nagekeo</li>
                    <li>Email: admin@mengeruda.id</li>
                    <li>Jam Pelayanan Online: 24 Jam</li>
                </ul>
            </div>
        </div>

        <div class="border-t border-slate-800 mt-8 pt-6 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500">
            <p>&copy; {new Date().getFullYear()} Pemerintah Desa Mengeruda. Hak Cipta Dilindungi.</p>
            <p>Didukung oleh Prakarsa Kreatif - e-surat.mengeruda.id</p>
        </div>
    </div>
</footer>
