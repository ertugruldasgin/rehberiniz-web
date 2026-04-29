import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gizlilik Politikası | Rehberiniz",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-6 py-16 space-y-10">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Gizlilik Politikası
          </h1>
          <p className="text-sm text-muted-foreground">
            Son güncelleme: Nisan 2026
          </p>
        </div>

        <div className="space-y-8 text-sm leading-relaxed text-foreground/80">
          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">
              1. Veri Sorumlusu
            </h2>
            <p>
              Bu platform, rehberlik hizmetleri kapsamında öğrenci ve öğretmen
              verilerini işleyen Rehberiniz tarafından işletilmektedir.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">
              2. Toplanan Veriler
            </h2>
            <p>
              Platform aracılığıyla aşağıdaki kişisel veriler işlenmektedir:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>Ad ve soyad</li>
              <li>E-posta adresi</li>
              <li>Sınav sonuçları ve net bilgileri</li>
              <li>Rehberlik görüşme notları</li>
              <li>Hedef bilgileri</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">
              3. Verilerin İşlenme Amacı
            </h2>
            <p>
              Toplanan veriler yalnızca rehberlik hizmeti kapsamında öğrenci
              gelişiminin takibi, sınav performansının analizi ve
              öğretmen-öğrenci iletişiminin desteklenmesi amacıyla
              kullanılmaktadır.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">
              4. Verilerin Paylaşımı
            </h2>
            <p>
              Kişisel verileriniz; yasal zorunluluklar dışında hiçbir üçüncü
              tarafla paylaşılmamakta, satılmamakta veya kiralanmamaktadır.
              Verileriniz yalnızca bağlı olduğunuz kurum yöneticisi ve
              öğretmeniniz tarafından görüntülenebilir.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">
              5. Veri Güvenliği
            </h2>
            <p>
              Verileriniz Supabase altyapısı üzerinde şifreli olarak
              saklanmaktadır. Erişim yalnızca yetkili kullanıcılarla sınırlıdır.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">
              6. Saklama Süresi
            </h2>
            <p>
              Verileriniz, hizmet ilişkisi devam ettiği sürece saklanır. Hizmet
              ilişkisinin sona ermesi durumunda verileriniz 30 gün içinde
              silinir.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">
              7. Haklarınız
            </h2>
            <p>
              6698 sayılı Kişisel Verilerin Korunması Kanunu&apos;nun 11.
              maddesi kapsamında verilerinize erişim, düzeltme ve silme talep
              etme hakkına sahipsiniz. Talepleriniz için{" "}
              <a
                href="mailto:ertugruldasgin@gmail.com"
                className="text-primary underline underline-offset-4"
              >
                ertugruldasgin@gmail.com
              </a>{" "}
              adresinden iletişime geçebilirsiniz.
            </p>
          </section>
        </div>

        <div className="pt-6 border-t border-muted-foreground">
          <Button className="hover:cursor-pointer">
            <Link href="/login">Giriş sayfasına dön</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
